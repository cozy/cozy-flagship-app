import AsyncStorage from '@react-native-async-storage/async-storage'
import BackgroundGeolocation from 'react-native-background-geolocation'

import { uploadData, getFlagFailUpload } from './upload'
import {
  StorageKeys,
  storeData,
  getData
} from '../../../../libs/localStore/storage'
import { Log } from '../helpers'

export { getAllLogs, sendLogFile } from '../helpers'
export { getId, getOrCreateId, updateId } from './user'
export { uploadData } from './upload'
export { GeolocationTrackingHeadlessTask } from './headless'

const waitBeforeStopMotionEventMin = 10 // Align with openpath: https://github.com/e-mission/e-mission-server/blob/master/emission/analysis/intake/segmentation/trip_segmentation.py#L59

export const startTracking = async () => {
  try {
    Log('Starting')

    await BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      showsBackgroundLocationIndicator: false, // Displays a blue pill on the iOS status bar when the location services are in use in the background (if the app doesn't have 'always' permission, the blue pill will always appear when location services are in use while the app isn't focused)
      distanceFilter: 20,
      elasticityMultiplier: 3,
      locationUpdateInterval: 10000, // Only used if on Android and if distanceFilter is 0
      stationaryRadius: 50, // Minimum is 25, but still usually takes 200m
      // Activity Recognition
      stopTimeout: waitBeforeStopMotionEventMin,
      // Application config
      debug: false, // <-- enable this hear sounds for background-geolocation life-cycle and notifications
      logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config

      batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: false, // <-- [Default: true] Set true to sync each location to server as it arrives.
      stopOnTerminate: false, // Allow the background-service to continue tracking when user closes the app, for Android. Maybe also useful for ios https://transistorsoft.github.io/react-native-background-geolocation/interfaces/config.html#stoponterminate
      enableHeadless: true,
      foregroundService: true,
      backgroundPermissionRationale: {
        message:
          'Mémoriser vos déplacements nécessite de ≪ {backgroundPermissionOptionLabel} ≫'
      }
    })
    await BackgroundGeolocation.start()
    await storeData(StorageKeys.ShouldBeTrackingFlagStorageAdress, true)

    return true
  } catch {
    return false
  }
}

export const stopTracking = async () => {
  try {
    if ((await BackgroundGeolocation.getState()).enabled) {
      await BackgroundGeolocation.stop()
      await storeData(StorageKeys.ShouldBeTrackingFlagStorageAdress, false)
      Log('Turned off tracking, uploading...')
      await uploadData({ force: true }) // Forced end, but if fails no current solution (won't retry until turned back on)
    } else {
      Log('Already off')
    }
    return true
  } catch {
    return false
  }
}

export const handleMotionChange = async event => {
  Log('[MOTION CHANGE] - ' + JSON.stringify(event))

  const isStationary = !event.isMoving || event.activity?.still // The isMoving param does not seem reliable with Android headless mode
  if (isStationary) {
    // Get the event timestamp to filter out locations tracked after this
    const stationaryTs = event.location?.timestamp
    Log('Auto uploading from stop')
    await uploadData({ untilTs: stationaryTs })
  }
}

export const handleConnectivityChange = async event => {
  Log('[CONNECTIVITY CHANGE] - ' + JSON.stringify(event))

  // Does not work with iOS emulator, event.connected is always false
  if (event.connected && (await getFlagFailUpload())) {
    Log('Auto uploading from reconnection and failed last attempt')
    await uploadData()
  }
}

// Register on motion change
BackgroundGeolocation.onMotionChange(async event => {
  Log('Enter onMotion change event')
  return handleMotionChange(event)
})

BackgroundGeolocation.onConnectivityChange(async event => {
  return handleConnectivityChange(event)
})

export const clearAllCozyGPSMemoryData = async () => {
  await BackgroundGeolocation.destroyLocations()
  await AsyncStorage.multiRemove([
    StorageKeys.IdStorageAdress,
    StorageKeys.FlagFailUploadStorageAdress,
    StorageKeys.LastPointUploadedAdress,
    StorageKeys.LastStopTransitionTsKey,
    StorageKeys.LastStartTransitionTsKey
  ])
  // Only exception : ShouldBeTrackingFlagStorageAdress, don't know the effects on the switch and would not feel natural anyway
  // await clearOldCozyGPSMemoryStorage()
  await BackgroundGeolocation.logger.destroyLog()
  Log('Everything cleared')
}

export const stopTrackingAndClearData = async () => {
  await stopTracking()
  await BackgroundGeolocation.destroyLocations()
  await BackgroundGeolocation.logger.destroyLog()
  await AsyncStorage.multiRemove([
    StorageKeys.IdStorageAdress,
    StorageKeys.FlagFailUploadStorageAdress,
    StorageKeys.LastPointUploadedAdress,
    StorageKeys.ShouldBeTrackingFlagStorageAdress,
    StorageKeys.LastStopTransitionTsKey,
    StorageKeys.LastStartTransitionTsKey
  ])
  Log('Tracking stopped and everything cleared')
}

export const getShouldStartTracking = async () => {
  return await getData(StorageKeys.ShouldBeTrackingFlagStorageAdress)
}
