import { format } from 'date-fns'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import RNPrint from 'react-native-print'
import Toast from 'react-native-toast-message'

import MiniLog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { t } from '/locales/i18n'

const log = MiniLog('intents:print')

const safeDeleteFile = async (path: string): Promise<void> => {
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path)
    }
  } catch (err) {
    log.error(
      `Something went wront while deleting document to print: ${getErrorMessage(
        err
      )}`
    )
  }
}

const getPrintFolderPath = (): string => {
  return `${RNFS.TemporaryDirectoryPath}/print/`
}

const getTemporaryPrintFilePath = (): string => {
  const date = format(new Date(), 'yyyyMMddHHmmssSSS')
  const tempFileName = `temp_print_${date}.printfile`

  const pathPrefix = Platform.OS === 'android' ? 'file://' : ''

  const path = `${pathPrefix}${getPrintFolderPath()}${tempFileName}`

  return path
}

const ensurePrintFolder = async (): Promise<void> => {
  await RNFS.mkdir(getPrintFolderPath())
}

export const printBase64Doc = async (base64?: string): Promise<void> => {
  const path = getTemporaryPrintFilePath()

  try {
    if (!base64) throw new Error('No base64 provided')

    await ensurePrintFolder()
    await RNFS.writeFile(path, base64, 'base64')

    await RNPrint.print({ filePath: path })
  } catch (err) {
    log.error(
      `Something went wront while trying to print document: ${getErrorMessage(
        err
      )}`
    )

    Toast.show({
      type: 'error',
      text1: t('error.unknown_error')
    })
  } finally {
    await safeDeleteFile(path)
  }
}
