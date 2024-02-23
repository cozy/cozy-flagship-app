import { getTs, Log } from '/app/domain/geolocation/helpers'
import {
  getData,
  CozyPersistedStorageKeys,
  storeData,
  removeData
} from '/libs/localStore/storage'

import BackgroundGeolocation from 'react-native-background-geolocation'

export const clearAllCozyGPSMemoryData = async () => {
  await BackgroundGeolocation.destroyLocations()
  await removeData(CozyPersistedStorageKeys.IdStorageAdress)
  await removeData(CozyPersistedStorageKeys.FlagFailUploadStorageAdress)
  await removeData(CozyPersistedStorageKeys.LastPointUploadedAdress)
  await removeData(CozyPersistedStorageKeys.LastStopTransitionTsKey)
  await removeData(CozyPersistedStorageKeys.LastStartTransitionTsKey)
  await removeData(CozyPersistedStorageKeys.GeolocationTrackingConfig)
  await removeData(CozyPersistedStorageKeys.Activities)
  // Only exception : ShouldBeTrackingFlagStorageAdress, don't know the effects on the switch and would not feel natural anyway
  // await clearOldCozyGPSMemoryStorage()
  await BackgroundGeolocation.logger.destroyLog()
  Log('Everything cleared')
}

export const clearAllData = async () => {
  await clearAllCozyGPSMemoryData()
  await removeData(CozyPersistedStorageKeys.ShouldBeTrackingFlagStorageAdress)
}

export const getShouldStartTracking = async () => {
  return await getData(
    CozyPersistedStorageKeys.ShouldBeTrackingFlagStorageAdress
  )
}

export const clearAllActivities = async () => {
  return removeData(CozyPersistedStorageKeys.Activities)
}

export const getLastPointUploaded = async () => {
  return await getData(CozyPersistedStorageKeys.LastPointUploadedAdress)
}

export const setLastPointUploaded = async value => {
  await storeData(CozyPersistedStorageKeys.LastPointUploadedAdress, value)
}

export const setLastStopTransitionTs = async timestamp => {
  await storeData(
    CozyPersistedStorageKeys.LastStopTransitionTsKey,
    timestamp.toString()
  )
}

export const setLastStartTransitionTs = async timestamp => {
  await storeData(
    CozyPersistedStorageKeys.LastStartTransitionTsKey,
    timestamp.toString()
  )
}

export const getLastStopTransitionTs = async () => {
  const ts = await getData(CozyPersistedStorageKeys.LastStopTransitionTsKey)
  return ts ? parseInt(ts, 10) : 0
}

export const getLastStartTransitionTs = async () => {
  const ts = await getData(CozyPersistedStorageKeys.LastStartTransitionTsKey)
  return ts ? parseInt(ts, 10) : 0
}

export const storeFlagFailUpload = async Flag => {
  try {
    await storeData(
      CozyPersistedStorageKeys.FlagFailUploadStorageAdress,
      Flag ? 'true' : 'false'
    )
  } catch (error) {
    Log('Error while storing FlagFailUpload:' + error.toString())
    throw error
  }
}

export const getFlagFailUpload = async () => {
  try {
    let value = await getData(
      CozyPersistedStorageKeys.FlagFailUploadStorageAdress
    )
    if (value == undefined) {
      await storeFlagFailUpload(false)
      return false
    } else {
      return value == 'true'
    }
  } catch (error) {
    Log('Error while getting FlagFailUpload:' + error.toString())
    throw error
  }
}

export const getFetchServiceWebHook = async () => {
  return await getData(CozyPersistedStorageKeys.ServiceWebhookURL)
}

export const storeFetchServiceWebHook = async webhookURL => {
  return storeData(CozyPersistedStorageKeys.ServiceWebhookURL, webhookURL)
}

export const getId = async () => {
  return await getData(CozyPersistedStorageKeys.IdStorageAdress)
}

export const storeId = async Id => {
  await storeData(CozyPersistedStorageKeys.IdStorageAdress, Id)
}

const setActivities = async activities => {
  return storeData(CozyPersistedStorageKeys.Activities, activities)
}

export const storeActivity = async activity => {
  Log('Lets store activity : ' + JSON.stringify(activity))
  if (!activity) {
    return null
  }
  const activities = await getActivities()
  if (activities?.length > 0) {
    activities.push(activity)
    await setActivities(activities)
  } else {
    await setActivities([activity])
  }
}

export const getActivities = async ({ beforeTs } = {}) => {
  const activities = await getData(CozyPersistedStorageKeys.Activities)
  if (!activities) {
    return []
  }
  if (beforeTs) {
    const activitiesBeforeTs = activities.filter(activity => {
      return activity?.data?.ts <= beforeTs
    })
    return activitiesBeforeTs
  }
  return activities
}

export const removeActivities = async ({ beforeTs } = {}) => {
  Log('Remove activities')
  if (!beforeTs) {
    return clearAllActivities()
  }
  const activities = await getActivities()
  const activitiesToKeep = activities.filter(activity => {
    if (activity?.data?.ts) {
      return activity.data.ts > beforeTs
    } else {
      return false
    }
  })
  await setActivities(activitiesToKeep)
}

export const cleanupTrackingData = async locations => {
  const uuidsToDelete = locations.map(location => location.uuid)
  const lastPointTs = getTs(locations[locations.length - 1])

  if (uuidsToDelete.length > 0) {
    Log('Removing local location records that were just uploaded...')
    for (const uuid of uuidsToDelete) {
      await BackgroundGeolocation.destroyLocation(uuid)
    }
    Log('Done removing local locations')
    if (lastPointTs) {
      await removeActivities({ beforeTs: lastPointTs })
      Log('Done removing activities')
    }
  }
}
