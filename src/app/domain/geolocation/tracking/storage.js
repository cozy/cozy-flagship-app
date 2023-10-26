import AsyncStorage from '@react-native-async-storage/async-storage'

import { Log } from '/app/domain/geolocation/helpers'
import { getData, StorageKeys, storeData } from '/libs/localStore/storage'

import BackgroundGeolocation from 'react-native-background-geolocation'

export const clearAllCozyGPSMemoryData = async () => {
  await BackgroundGeolocation.destroyLocations()
  await AsyncStorage.multiRemove([
    StorageKeys.IdStorageAdress,
    StorageKeys.FlagFailUploadStorageAdress,
    StorageKeys.LastPointUploadedAdress,
    StorageKeys.LastStopTransitionTsKey,
    StorageKeys.LastStartTransitionTsKey,
    StorageKeys.GeolocationTrackingConfig,
    StorageKeys.Activities
  ])
  // Only exception : ShouldBeTrackingFlagStorageAdress, don't know the effects on the switch and would not feel natural anyway
  // await clearOldCozyGPSMemoryStorage()
  await BackgroundGeolocation.logger.destroyLog()
  Log('Everything cleared')
}

export const clearAllData = async () => {
  await clearAllCozyGPSMemoryData()
  await AsyncStorage.removeItem(StorageKeys.ShouldBeTrackingFlagStorageAdress)
}

export const getShouldStartTracking = async () => {
  return await getData(StorageKeys.ShouldBeTrackingFlagStorageAdress)
}

export const clearAllActivities = async () => {
  return AsyncStorage.removeItem(StorageKeys.Activities)
}

export const getLastPointUploaded = async () => {
  return await getData(StorageKeys.LastPointUploadedAdress)
}

export const setLastPointUploaded = async value => {
  await storeData(StorageKeys.LastPointUploadedAdress, value)
}

export const setLastStopTransitionTs = async timestamp => {
  await storeData(StorageKeys.LastStopTransitionTsKey, timestamp.toString())
}

export const setLastStartTransitionTs = async timestamp => {
  await storeData(StorageKeys.LastStartTransitionTsKey, timestamp.toString())
}

export const getLastStopTransitionTs = async () => {
  const ts = await getData(StorageKeys.LastStopTransitionTsKey)
  return ts ? parseInt(ts, 10) : 0
}

export const getLastStartTransitionTs = async () => {
  const ts = await getData(StorageKeys.LastStartTransitionTsKey)
  return ts ? parseInt(ts, 10) : 0
}

export const storeFlagFailUpload = async Flag => {
  try {
    await storeData(
      StorageKeys.FlagFailUploadStorageAdress,
      Flag ? 'true' : 'false'
    )
  } catch (error) {
    Log('Error while storing FlagFailUpload:' + error.toString())
    throw error
  }
}

export const getFlagFailUpload = async () => {
  try {
    let value = await getData(StorageKeys.FlagFailUploadStorageAdress)
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

export const getId = async () => {
  return await getData(StorageKeys.IdStorageAdress)
}

export const storeId = async Id => {
  await storeData(StorageKeys.IdStorageAdress, Id)
}

const setActivities = async activities => {
  return storeData(StorageKeys.Activities, activities)
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
  const activities = await getData(StorageKeys.Activities)
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
  Log('All activities to remove ' + JSON.stringify(activities)) // TODO: useful for debug, but should be removed eventually
  const activitiesToKeep = activities.filter(activity => {
    if (activity?.data?.ts) {
      return activity.data.ts > beforeTs
    } else {
      return false
    }
  })
  await setActivities(activitiesToKeep)
}
