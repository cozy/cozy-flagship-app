import {
  startTracking,
  stopTracking,
  sendLogFile,
  uploadData,
  getId,
  updateId,
  stopTrackingAndClearData
} from '../../../../../CozyGPSMemory/geolocation/services'

export { stopTrackingAndClearData }

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
