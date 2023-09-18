import {
  startTracking,
  stopTracking
} from '../../../../../CozyGPSMemory/geolocation/services'

export const setGeolocationTracking = async (
  enabled: boolean
): Promise<boolean> => {
  if (enabled) {
    return await startTracking()
  } else {
    return await stopTracking()
  }
}
