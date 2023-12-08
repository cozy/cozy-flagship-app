import { format } from 'date-fns'
import RNFS from 'react-native-fs'
import RNPrint from 'react-native-print'
import Toast from 'react-native-toast-message'

import MiniLog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { t } from '/locales/i18n'

const log = MiniLog('intents:print')

// File Handling
const getPrintFolderPath = (): string => {
  return `${RNFS.TemporaryDirectoryPath}/print`
}

const getTemporaryPrintFilePath = (fileExtension: string): string => {
  const date = format(new Date(), 'yyyyMMddHHmmssSSS')
  const tempFileName = `file_${date}.${fileExtension}`
  const path = `${getPrintFolderPath()}/${tempFileName}`
  return path
}

const ensurePrintFolder = async (): Promise<void> => {
  await RNFS.mkdir(getPrintFolderPath())
}

const safeDeleteFile = async (path: string): Promise<void> => {
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path)
    }
  } catch (err) {
    log.error(`Error deleting document: ${getErrorMessage(err)}`)
  }
}

const writeFile = async (filePath: string, content: string): Promise<void> => {
  return await RNFS.writeFile(filePath, content, 'base64')
}

// Data URI Handling
const getFileTypeFromDataURI = (dataURI: string): string => {
  const mediaTypePattern = /^data:(.*?);base64,/
  const match = dataURI.match(mediaTypePattern)
  if (match?.[1]) {
    const mediaType = match[1]
    const parts = mediaType.split('/')
    return parts[1]
  }
  throw new Error('Could not determine file type from data URI')
}

const getContentFromBase64 = (base64String: string): string => {
  const dataUriPattern = /^data:([a-zA-Z]+\/[a-zA-Z]+);base64,/
  return dataUriPattern.test(base64String)
    ? base64String.split('base64,')[1]
    : base64String
}

// Print Handling (main feature)
export const printBase64Doc = async (base64?: string): Promise<void> => {
  let filePath = ''

  try {
    if (!base64) throw new Error('No base64 provided')
    filePath = getTemporaryPrintFilePath(getFileTypeFromDataURI(base64))
    const fileContent = getContentFromBase64(base64)
    await ensurePrintFolder()
    await writeFile(filePath, fileContent)
    await RNPrint.print({ filePath })
  } catch (err) {
    log.error(`Error while printing document: ${getErrorMessage(err)}`)
    Toast.show({
      type: 'error',
      text1: t('errors.print')
    })
  } finally {
    await safeDeleteFile(filePath)
  }
}
