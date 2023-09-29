import { format } from 'date-fns'
import { Image, Platform } from 'react-native'
import RNFS from 'react-native-fs'
import MlkitOcr, { MlkitOcrResult } from 'react-native-mlkit-ocr'

import Minilog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('OCR')

interface ImageSize {
  width: number
  height: number
}

export interface ProcessOcrResult {
  OCRResult: MlkitOcrResult
  imgSize: ImageSize
}

export const processOcr = async (
  base64: string
): Promise<ProcessOcrResult | undefined> => {
  const path = getTemporaryOcrFilePath()

  try {
    const imgSize = await getBase64ImageSize(base64)

    await ensureOCRFolder()
    await RNFS.writeFile(path, base64, 'base64')

    const OCRResult = await MlkitOcr.detectFromFile(path)

    return {
      OCRResult,
      imgSize
    }
  } catch (err) {
    log.error(
      `Something went wront while processing OCR: ${getErrorMessage(err)}`
    )
    return undefined
  } finally {
    await safeDeleteFile(path)
  }
}

export const isOcrAvailable = (): boolean => {
  return true
}

const getOCRFolderPath = (): string => {
  return `${RNFS.TemporaryDirectoryPath}/OCR/`
}

const getTemporaryOcrFilePath = (): string => {
  const date = format(new Date(), 'yyyyMMddHHmmssSSS')
  const tempFileName = `temp_ocr_${date}.ocrfile`

  const pathPrefix = Platform.OS === 'android' ? 'file://' : ''

  const path = `${pathPrefix}${getOCRFolderPath()}${tempFileName}`

  return path
}

const ensureOCRFolder = async (): Promise<void> => {
  await RNFS.mkdir(getOCRFolderPath())
}

const safeDeleteFile = async (path: string): Promise<void> => {
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path)
    }
  } catch (err) {
    log.error(
      `Something went wront while deleting OCR file: ${getErrorMessage(err)}`
    )
  }
}

const getBase64ImageSize = (base64: string): Promise<ImageSize> => {
  return new Promise((resolve, reject) => {
    try {
      Image.getSize(`data:image/png;base64,${base64}`, (width, height) => {
        resolve({ width, height })
      })
    } catch (e) {
      reject(e)
    }
  })
}
