import { Platform } from 'react-native'
import DocumentScanner, {
  ResponseType
} from 'react-native-document-scanner-plugin'

type Base64 = string

export const scanDocument = async (): Promise<Base64 | undefined> => {
  try {
    const { scannedImages } = await DocumentScanner.scanDocument({
      responseType: ResponseType.Base64,
      maxNumDocuments: 1
    })

    return scannedImages?.[0]
  } catch {
    return undefined
  }
}

export const isScannerAvailable = (): boolean => {
  const isAvailable =
    Platform.OS === 'ios' ? parseInt(Platform.Version, 10) >= 13 : true

  return isAvailable
}
