import { Platform } from 'react-native'
import DocumentScanner from 'react-native-document-scanner-plugin'
import type { ResponseType } from 'react-native-document-scanner-plugin/src/NativeDocumentScanner'

import {
  storeSharedMemory,
  removeSharedMemory
} from '/libs/localStore/sharedMemory'

type Base64 = string

export const scanDocument = async (): Promise<Base64 | undefined> => {
  try {
    removeSharedMemory('mespapiers', 'scanDocument')

    const { scannedImages } = await DocumentScanner.scanDocument({
      responseType: 'base64' as ResponseType,
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
