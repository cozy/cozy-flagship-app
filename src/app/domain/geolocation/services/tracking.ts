import BackgroundGeolocation from 'react-native-background-geolocation'

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
import { isGeolocationQuotaExceeded } from '/app/domain/geolocation/helpers/quota'

import CozyClient from 'cozy-client/types/CozyClient'

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

export const sendGeolocationTrackingLogs = async (): Promise<void> => {
  await sendLogFile()
}

export const forceUploadGeolocationTrackingData = async (): Promise<void> => {
  await uploadData({ force: true })
}

interface GeolocationTrackingStatus {
  enabled: boolean
  quotaExceeded: boolean
}

export const isGeolocationTrackingEnabled = async (): Promise<boolean> => {
  const status = await BackgroundGeolocation.getState()

  return status.enabled
}

export const getGeolocationTrackingStatus = async (
  client: CozyClient | undefined
): Promise<GeolocationTrackingStatus> => {
  if (!client) {
    throw new Error('You must be logged in to use geolocation tracking feature')
  }

  return {
    enabled: await isGeolocationTrackingEnabled(),
    quotaExceeded: await isGeolocationQuotaExceeded(client)
  }
}
