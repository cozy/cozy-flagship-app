import DocumentScanner, {
  ResponseType
} from 'react-native-document-scanner-plugin'

type Base64 = string

export const scanDocument = async (): Promise<Base64 | undefined> => {
  const { scannedImages } = await DocumentScanner.scanDocument({
    responseType: ResponseType.Base64,
    maxNumDocuments: 1
  })

  return scannedImages?.[0]
}
