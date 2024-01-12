import BackgroundGeolocation from 'react-native-background-geolocation'

import Minilog from 'cozy-minilog'

import { uploadData } from '/app/domain/geolocation/tracking/upload'
import { StorageKeys, storeData, getData } from '/libs/localStore/storage'
import { Log } from '/app/domain/geolocation/helpers'
import { saveActivity } from '/app/domain/geolocation/tracking/tracking'
import {
  clearAllData,
  getFlagFailUpload
} from '/app/domain/geolocation/tracking/storage'
import { t } from '/locales/i18n'
import {
  ACCURACY,
  DEFAULT_TRACKING_CONFIG,
  DISTANCE_FILTER,
  ELASTICITY_MULTIPLIER,
  STILL_ACTIVITY,
  WAIT_BEFORE_STOP_MOTION_EVENT,
  WALKING_ACTIVITY,
  LOW_CONFIDENCE_THRESHOLD
} from '/app/domain/geolocation/tracking/consts'

export { Log, getAllLogs, sendLogFile } from '/app/domain/geolocation/helpers'
export { getOrCreateId, updateId } from '/app/domain/geolocation/tracking/user'
export { uploadData } from '/app/domain/geolocation/tracking/upload'
export { GeolocationTrackingHeadlessTask } from '/app/domain/geolocation/tracking/headless'
import {
  GeolocationTrackingEmitter,
  TRIP_END
} from '/app/domain/geolocation/tracking/events'

export {
  clearAllCozyGPSMemoryData,
  getShouldStartTracking,
  getId
} from '/app/domain/geolocation/tracking/storage'

const log = Minilog('📍 Geolocation')

export const startTracking = async () => {
  try {
    const trackingConfig = await getTrackingConfig()
    Log('Config : ' + JSON.stringify(trackingConfig))

    const state = await BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: trackingConfig.desiredAccuracy || ACCURACY,
      showsBackgroundLocationIndicator: false, // Displays a blue pill on the iOS status bar when the location services are in use in the background (if the app doesn't have 'always' permission, the blue pill will always appear when location services are in use while the app isn't focused)
      distanceFilter: trackingConfig.distanceFilter || DISTANCE_FILTER,
      elasticityMultiplier: 1,
      stationaryRadius: 30, // Minimum is 25, but still usually takes 200m
      // Activity Recognition
      stopTimeout: WAIT_BEFORE_STOP_MOTION_EVENT,
      // Application config
      debug: false, // <-- enable this hear sounds for background-geolocation life-cycle and notifications
      logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.
      batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: false, // <-- [Default: true] Set true to sync each location to server as it arrives.
      stopOnTerminate: false, // Allow the background-service to continue tracking when user closes the app, for Android. Maybe also useful for ios https://transistorsoft.github.io/react-native-background-geolocation/interfaces/config.html#stoponterminate
      enableHeadless: true,
      foregroundService: true,
      logMaxDays: 5, // Default is 3
      maxDaysToPersist: 10, // The maximum retention days for local location data. Default is 1 day, which can result in removal of local points in case of upload failures.
      backgroundPermissionRationale: {
        message: t(
          'services.geolocationTracking.androidBackgroundPermissionMessage'
        )
      },
      notification: {
        title: t('services.geolocationTracking.androidNotificationTitle'),
        text: t('services.geolocationTracking.androidNotificationDescription'),
        smallIcon: 'mipmap/ic_stat_ic_notification'
      }
    })
    if (!state.enabled) {
      await BackgroundGeolocation.start()
      Log('Tracking started')
    }
    await storeData(StorageKeys.ShouldBeTrackingFlagStorageAdress, true)

    return true
  } catch (e) {
    log.error(e)

    return false
  }
}

const isTrackingEnabled = async () => {
  const state = await BackgroundGeolocation.getState()
  if (!state) {
    return false
  }
  return Boolean(state.enabled)
}

export const stopTracking = async () => {
  try {
    const isTrackingStarted = await isTrackingEnabled()
    if (isTrackingStarted) {
      await BackgroundGeolocation.stop()
      await storeData(StorageKeys.ShouldBeTrackingFlagStorageAdress, false)
      Log('Turned off tracking, uploading...')
      await uploadData({ force: true }) // Forced end, but if fails no current solution (won't retry until turned back on)
    } else {
      Log('Tracking already off')
    }
    return true
  } catch (e) {
    log.error(e)

    return false
  }
}

export const stopTrackingAndClearData = async () => {
  await stopTracking()
  await clearAllData()
  Log('Tracking stopped and everything cleared')
}

export const getTrackingConfig = async () => {
  const localTrackingConfig = await getData(
    StorageKeys.GeolocationTrackingConfig
  )

  return localTrackingConfig ?? DEFAULT_TRACKING_CONFIG
}

export const saveTrackingConfig = async newTrackingConfig => {
  await BackgroundGeolocation.setConfig(newTrackingConfig)

  Log(
    `Tracking config updated in realtime with ${JSON.stringify(
      newTrackingConfig
    )}`
  )

  await storeData(StorageKeys.GeolocationTrackingConfig, newTrackingConfig)
}

const enableElasticity = async () => {
  const state = await BackgroundGeolocation.getState()
  if (state?.elasticityMultiplier <= 1) {
    Log('Enable elasticity')
    const trackingConfig = await getTrackingConfig()
    return BackgroundGeolocation.setConfig({
      elasticityMultiplier:
        trackingConfig.elasticityMultiplier || ELASTICITY_MULTIPLIER
    })
  }
}

const disableElasticity = async () => {
  Log('Disable elasticity')
  return BackgroundGeolocation.setConfig({
    elasticityMultiplier: 1
  })
}

export const handleActivityChange = async event => {
  Log('[ACTIVITY CHANGE] - ' + JSON.stringify(event))
  if (
    event?.activity !== STILL_ACTIVITY &&
    event?.activity !== WALKING_ACTIVITY
  ) {
    // Enable elasticity after first fast-enough location to reduce battery impact
    enableElasticity()
  }

  if (
    event?.activity === STILL_ACTIVITY &&
    event?.confidence <= LOW_CONFIDENCE_THRESHOLD
  ) {
    // Do not save event if it's a still activity with low confidence
    // We noticed that iOS can produce a lot of those events, hurting battery
    return
  }
  await saveActivity(event)
}

export const handleMotionChange = async event => {
  Log('[MOTION CHANGE] - ' + JSON.stringify(event))

  const isStationary = !event.isMoving || event.activity?.still // The isMoving param does not seem reliable with Android headless mode
  if (isStationary) {
    // Get the event timestamp to filter out locations tracked after this
    const stationaryTs = event.location?.timestamp
    Log('Auto uploading from stop')
    await uploadData({ untilTs: stationaryTs })
    GeolocationTrackingEmitter.emit(TRIP_END)
    // Disable elasticity to improve next point accuracy
    disableElasticity()
  }
}

export const handleConnectivityChange = async event => {
  Log('[CONNECTIVITY CHANGE] - ' + JSON.stringify(event))

  // Does not work with iOS emulator, event.connected is always false
  if (event.connected && (await getFlagFailUpload())) {
    Log('Auto uploading from reconnection and failed last attempt')
    await uploadData()
    GeolocationTrackingEmitter.emit(TRIP_END)
  }
}

// Register on activity change
BackgroundGeolocation.onActivityChange(async event => {
  return handleActivityChange(event)
})

// Register on motion change
BackgroundGeolocation.onMotionChange(async event => {
  return handleMotionChange(event)
})

BackgroundGeolocation.onConnectivityChange(async event => {
  return handleConnectivityChange(event)
})
