import { Platform } from 'react-native'
import DocumentScanner, {
  ResponseType
} from 'react-native-document-scanner-plugin'

import {
  storeSharedMemory,
  removeSharedMemory
} from '/libs/localStore/sharedMemory'

type Base64 = string

export const scanDocument = async (): Promise<Base64 | undefined> => {
  try {
    removeSharedMemory('mespapiers', 'scanDocument')

    const { scannedImages } = await DocumentScanner.scanDocument({
      responseType: ResponseType.Base64,
      maxNumDocuments: 1
    })

    const scanResult = scannedImages
      ? scannedImages[scannedImages.length - 1]
      : undefined

    storeSharedMemory('mespapiers', 'scanDocument', scanResult)

    return scanResult
  } catch {
    return undefined
  }
}

export const isScannerAvailable = (): boolean => {
  const isAvailable =
    Platform.OS === 'ios' ? parseInt(Platform.Version, 10) >= 13 : true

  return isAvailable
}
