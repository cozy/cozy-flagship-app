import BackgroundGeolocation from 'react-native-background-geolocation'

import CozyClient from 'cozy-client/types/CozyClient'

import {
  startTracking,
  stopTracking,
  sendLogFile,
  uploadData,
  getId,
  updateId,
  stopTrackingAndClearData,
  getShouldStartTracking
} from '/app/domain/geolocation/tracking'

export { stopTrackingAndClearData, getShouldStartTracking }

export const getGeolocationTrackingId = async (): Promise<string> => {
  return (await getId()) as string
}

export const setGeolocationTrackingId = async (
  newId: string
): Promise<void> => {
  await updateId(newId)
}

export const setGeolocationTracking = async (
  enabled: boolean
): Promise<boolean> => {
  if (enabled) {
    return await startTracking()
  } else {
    return await stopTracking()
  }
}

export const sendGeolocationTrackingLogs = async (
  client?: CozyClient
): Promise<void> => {
  await sendLogFile(client)
}

export const forceUploadGeolocationTrackingData = async (): Promise<void> => {
  await uploadData({ force: true })
}

interface GeolocationTrackingStatus {
  enabled: boolean
}

export const getGeolocationTrackingStatus =
  async (): Promise<GeolocationTrackingStatus> => {
    const status = await BackgroundGeolocation.getState()

    return {
      enabled: status.enabled
    }
  }
