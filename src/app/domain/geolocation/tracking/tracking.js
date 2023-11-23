import { uploadUserCache } from '/app/domain/geolocation/tracking/upload'
import { getOrCreateUser } from '/app/domain/geolocation/tracking/user'
import { getTs, Log, parseISOString } from '/app/domain/geolocation/helpers'
import {
  getActivities,
  getLastPointUploaded,
  getLastStartTransitionTs,
  getLastStopTransitionTs,
  setLastStartTransitionTs,
  setLastStopTransitionTs,
  storeActivity,
  setLastPointUploaded,
  cleanupTrackingData
} from '/app/domain/geolocation/tracking/storage'

const largeTemporalDeltaBetweenPoints = 30 * 60 // In seconds. Shouldn't have longer breaks without siginificant motion
const maxTemporalDeltaBetweenPoints = 12 * 60 * 60 // In seconds. See https://github.com/e-mission/e-mission-server/blob/f6bf89a274e6cd10353da8f17ebb327a998c788a/emission/analysis/intake/segmentation/trip_segmentation_methods/dwell_segmentation_dist_filter.py#L194
const minSpeedBetweenDistantPoints = 0.1 // In m/s. Note the average walking speed is ~1.4 m/s
const MAX_DOCS_PER_BATCH = 10000

const LOW_CONFIDENCE_THRESHOLD = 0.5

export const createDataBatch = (locations, nRun, maxBatchSize) => {
  const startBatchPoint = nRun * maxBatchSize
  const endBatchPoint = (nRun + 1) * maxBatchSize
  const batchLocations = locations.slice(startBatchPoint, endBatchPoint)
  return batchLocations
}

// Future entry point of algorithm
// prepareTrackingData / extractTrackingDate
export const smartSend = async (locations, user, { force = false } = {}) => {
  await getOrCreateUser(user)

  if (!locations || locations.length === 0) {
    Log('No new locations')
    await uploadWithNoNewPoints({ user, force })
  } else {
    Log('Found pending locations, uploading: ' + locations.length)
    const previousPoint = await getLastPointUploaded()
    const motionData = await prepareMotionData({
      locations,
      lastBatchPoint: previousPoint
    })

    const nBatch = Math.floor(motionData.length / MAX_DOCS_PER_BATCH) + 1
    for (let i = 0; i < nBatch; i++) {
      Log('Creating batch ' + (i + 1) + '/' + nBatch)
      const data = createDataBatch(motionData, i, MAX_DOCS_PER_BATCH)
      // FIXME: what if the upload fails for a batch, in the middle of a transition or activity?
      const resp = await uploadUserCache(data, user)
      if (resp?.ok) {
        // Save last point and remove uploaded data
        await setLastPointUploaded(locations[locations.length - 1])
        Log('Saved last point')
        await cleanupTrackingData(locations)
      }
    }
    Log('Uploaded last batch')
  }
}

const prepareMotionData = async ({ locations, lastBatchPoint }) => {
  const contentToUpload = []

  if (locations?.length < 1) {
    return []
  }
  if (locations.length > 0) {
    Log(
      'Process points from ' +
        locations[0]?.timestamp +
        ' - to ' +
        locations[locations.length - 1]?.timestamp
    )
  }

  // Add activities stored in local storage
  const lastPointTs = getTs(locations[locations.length - 1])
  let activities = await getFilteredActivities({
    beforeTs: lastPointTs,
    locations
  })
  Log('Activities found : ' + activities?.length)
  if (activities?.length > 0) {
    contentToUpload.push(...activities)
  }
  const points = filterNonHeadingPointsAfterStillActivity(locations, activities)
  Log('Process points : ' + points?.length)
  if (!points) {
    return []
  }

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const previousPoint =
      i === 0 // Handles setting up the case for the first point
        ? lastBatchPoint // Can be undefined
        : points[i - 1]

    // ----- Step 1: Decide if transitions should be added
    if (!previousPoint) {
      Log(
        'No previous point found, adding start at ' +
          new Date(1000 * (getTs(point) - 1)) +
          's'
      )
      await addStartTransitions(contentToUpload, getTs(point) - 1)
    } else {
      const deltaT = getTs(point) - getTs(previousPoint)
      if (deltaT > maxTemporalDeltaBetweenPoints) {
        Log(
          'Noticed very long break: ' +
            deltaT +
            's at ' +
            new Date(1000 * getTs(previousPoint)),
          's between ' +
            new Date(1000 * getTs(previousPoint)) +
            ' and ' +
            new Date(1000 * getTs(point))
        )
        // Force a stop/start transition when the temporal delta is too high
        // Note forcing the transition won't automatically create a new trip, typically a long-distance
        // flight of 12h+ should behave as one trip, even with this transition.
        await addStopTransitions(contentToUpload, getTs(previousPoint) + 1)
        await addStartTransitions(contentToUpload, getTs(point) - 1)
      } else if (deltaT > largeTemporalDeltaBetweenPoints) {
        const distanceM = getDistanceFromLatLonInM(previousPoint, point)
        Log('Distance between points : ' + distanceM)
        const speed = distanceM / deltaT

        if (speed < minSpeedBetweenDistantPoints) {
          Log('Very slow speed: force transition')
          await addStopTransitions(contentToUpload, getTs(previousPoint) + 1)
          await addStartTransitions(contentToUpload, getTs(point) - 1)
        } else {
          Log('Long distance, leaving uninterrupted trip: ' + distanceM + 'm')
        }
      }
    }

    // -----Step 2: Add filtered points and motion activity

    if (i === 0) {
      // Add a start transition when it's the first point of the batch, and no start transition had been set
      const lastStartTransitionTs = await getLastStartTransitionTs()
      const lastStopTransitionTs = await getLastStopTransitionTs()
      if (lastStopTransitionTs >= lastStartTransitionTs) {
        Log('Based on timestamps, this is a new trip')
        await addStartTransitions(contentToUpload, getTs(point) - 1)
      }
    }

    // Condition de filtered_location:
    const samePosAsPrev =
      previousPoint &&
      point.coords.longitude === previousPoint.coords.longitude &&
      point.coords.latitude === previousPoint.coords.latitude
    const filtered = !samePosAsPrev && point.coords.accuracy <= 200

    addPoint(contentToUpload, point, filtered)
  }

  // -----Step 3: Force end trip for the last point, as the device had been stopped long enough after motion

  // FIXME: what if the upload failed and more points were added before the retry?
  // The stop transition might be missed?
  const deltaLastPoint = Date.now() / 1000 - lastPointTs
  Log('Delta last point : ' + deltaLastPoint)
  await addStopTransitions(contentToUpload, lastPointTs + 1)

  return contentToUpload
}

const uploadWithNoNewPoints = async ({ user, force = false }) => {
  const lastPoint = await getLastPointUploaded()
  const content = []

  if (force) {
    await addStopTransitions(content, Date.now() / 1000)
    await uploadUserCache(content, user)
  } else {
    if (lastPoint == undefined) {
      Log('No previous location either, no upload')
    } else {
      let deltaT = Date.now() / 1000 - getTs(lastPoint)
      if (deltaT > largeTemporalDeltaBetweenPoints) {
        // Note: no problem if we add a stop if there's already one
        Log(
          'Previous location old enough (' +
            deltaT +
            's ago), posting stop transitions at ' +
            new Date(1000 * getTs(lastPoint))
        )
        await addStopTransitions(content, getTs(lastPoint))
        await uploadUserCache(content, user)
        Log('Finished upload of stop transtitions')
      } else {
        Log('Previous location too recent (' + deltaT + 's ago), no upload')
      }
    }
  }
}

// Add start transitions, within 0.1s of given ts
const addStartTransitions = async (addedTo, ts) => {
  Log('Add start transitions on ' + new Date(ts * 1000))

  // TODO: some of those transitions seem useless
  addedTo.push(
    transition('STATE_WAITING_FOR_TRIP_START', 'T_EXITED_GEOFENCE', ts + 0.01)
  )
  addedTo.push(
    transition('STATE_WAITING_FOR_TRIP_START', 'T_TRIP_STARTED', ts + 0.02)
  )
  addedTo.push(transition('STATE_ONGOING_TRIP', 'T_TRIP_STARTED', ts + 0.03))
  addedTo.push(transition('STATE_ONGOING_TRIP', 'T_TRIP_RESTARTED', ts + 0.04))

  await setLastStartTransitionTs(ts)
}

// Add stop transitions, within 0.1s of given ts
const addStopTransitions = async (addedTo, ts) => {
  Log('Add stop transitions on ' + new Date(ts * 1000))

  // TODO: some of those transitions seem useless
  addedTo.push(transition('STATE_ONGOING_TRIP', 'T_VISIT_STARTED', ts + 0.01))
  addedTo.push(
    transition('STATE_ONGOING_TRIP', 'T_TRIP_END_DETECTED', ts + 0.02)
  )
  addedTo.push(
    transition('STATE_ONGOING_TRIP', 'T_END_TRIP_TRACKING', ts + 0.03)
  )
  addedTo.push(transition('STATE_ONGOING_TRIP', 'T_TRIP_ENDED', ts + 0.04))
  addedTo.push(transition('STATE_WAITING_FOR_TRIP_START', 'T_NOP', ts + 0.05))
  // This one is important as it is used to force a tracking stop by the server.
  // Missing it can result on wrong starting point as it will try to attach the end of the previous trip,
  // both spatially and temporally.
  // See https://github.com/e-mission/e-mission-server/blob/81c4314a776eff5dee61b01f1ca16a85ee267a10/emission/analysis/intake/segmentation/restart_checking.py#L96
  addedTo.push(
    transition(
      'STATE_WAITING_FOR_TRIP_START',
      'T_FORCE_STOP_TRACKING',
      ts + 0.06
    )
  )
  addedTo.push(
    transition('STATE_WAITING_FOR_TRIP_START', 'T_DATA_PUSHED', ts + 0.07)
  )
  await setLastStopTransitionTs(ts)
}

const transition = (state, transition, transition_ts) => {
  return {
    data: {
      currState: state,
      transition: transition,
      ts: transition_ts
    },
    metadata: {
      platform: 'ios',
      write_ts: transition_ts,
      time_zone: 'UTC',
      key: 'statemachine/transition',
      read_ts: 0,
      type: 'message'
    }
  }
}

const addPoint = (content, point, filtered) => {
  content.push(translateToEMissionLocationPoint(point))

  if (filtered) {
    content.push(translateToEMissionLocationPoint(point))
    content[content.length - 1].metadata.key = 'background/filtered_location'
  }
}

export const filterNonHeadingPointsAfterStillActivity = (
  locations,
  activities
) => {
  // Filter locations without heading and occuring after the last still activity
  // Those points might cause artifically extended trips
  if (!activities || activities?.length < 1) {
    return locations
  }
  const lastPointTs = getTs(locations[locations.length - 1])
  let lastStillActivityTs = null
  for (const activity of activities) {
    if (activity?.data?.stationary) {
      lastStillActivityTs = activity?.data?.ts
    }
  }
  if (!lastStillActivityTs) {
    lastStillActivityTs = lastPointTs
  }

  const points = locations.filter(loc => {
    return getTs(loc) <= lastStillActivityTs || loc?.coords?.heading > -1
  })
  return points
}

const getActivitiesFromLocations = locations => {
  if (!locations || locations.length < 1) {
    return null
  }
  const activities = locations.map(loc =>
    translateEventToEMissionMotionActivity(loc)
  )
  return activities
}

export const getFilteredActivities = async ({ beforeTs, locations }) => {
  let activities = await getActivities({ beforeTs })
  if (!activities || activities?.length < 1) {
    Log('No activity found in local storage. Get it from locations')
    // Fallback when no activity was captured
    const activitiesFromLoc = getActivitiesFromLocations(locations)
    return activitiesFromLoc
  }
  const result = []
  let previousActivity = null

  // Filter out consecutives stationary activities
  for (const activity of activities) {
    if (
      previousActivity &&
      previousActivity?.data?.stationary &&
      activity?.data?.stationary
    ) {
      // Skip the current activity as it's a consecutive stationary one
      continue
    }
    result.push(activity)
    previousActivity = activity
  }

  return result
}

const translateToEMissionLocationPoint = location_point => {
  let ts = Math.floor(parseISOString(location_point.timestamp).getTime() / 1000)
  return {
    data: {
      accuracy: location_point.coords.accuracy,
      altitude: location_point.coords.altitude,
      bearing: location_point.coords.heading,
      filter: 'distance',
      floor: 0,
      latitude: location_point.coords.latitude,
      longitude: location_point.coords.longitude,
      sensed_speed: location_point.coords.speed,
      ts: ts + 0.1, // FIXME: It's silly, but some rare operations of e-mission will take a timestamp without a decimal point as an integer and crash. Since it would be a hard crash, the pipeline will not attempt again for this user so the user would never get new tracks without intervention. This was the simplest way to insure that JSON.stringify() will leave a decimal point.
      vaccuracy: location_point.coords.altitude_accuracy
    },
    metadata: {
      platform: 'ios',
      write_ts: ts + 0.1, // FIXME
      time_zone: 'UTC',
      key: 'background/location',
      read_ts: 0,
      type: 'sensor-data'
    }
  }
}

const translateEventToEMissionMotionActivity = event => {
  const ts = Math.floor(parseISOString(event.timestamp).getTime() / 1000)
  // See: https://transistorsoft.github.io/react-native-background-geoevent/interfaces/motionactivity.html#type
  return {
    data: {
      cycling: event.activity.type === 'on_bicycle',
      running: event.activity.type === 'running',
      walking:
        event.activity.type === 'walking' || event.activity.type === 'on_foot', // on_foot includes running or walking
      automotive: event.activity.type === 'in_vehicle',
      stationary: event.activity.type === 'still',
      unknown: event.activity.type === 'unknown',
      confidence: event.activity.confidence,
      ts: ts + 0.1, // FIXME
      confidence_level:
        event.activity.confidence > 75
          ? 'high'
          : event.activity.confidence > LOW_CONFIDENCE_THRESHOLD
          ? 'medium'
          : 'low'
    },
    metadata: {
      write_ts: ts + 0.1, // FIXME
      time_zone: 'UTC',
      platform: 'ios',
      key: 'background/motion_activity',
      read_ts: 0,
      type: 'sensor-data'
    }
  }
}

export const saveActivity = async event => {
  if (event.confidence < LOW_CONFIDENCE_THRESHOLD) {
    // Filter out low confidence activities
    return null
  }
  const activityEvent = {
    activity: {
      confidence: event.confidence,
      type: event.activity
    },
    timestamp: new Date().toISOString()
  }
  const activity = translateEventToEMissionMotionActivity(activityEvent)
  Log('Save activity : ' + JSON.stringify(activity))
  await storeActivity(activity)
  return activity
}

const deg2rad = deg => {
  return deg * (Math.PI / 180)
}

// TODO: use cozy-client method
const getDistanceFromLatLonInM = (point1, point2) => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(point2.coords.latitude - point1.coords.latitude) // deg2rad below
  const dLon = deg2rad(point2.coords.longitude - point1.coords.longitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.coords.latitude)) *
      Math.cos(deg2rad(point2.coords.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d * 1000
}
