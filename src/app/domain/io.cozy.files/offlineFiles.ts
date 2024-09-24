import { Alert } from 'react-native'
import FileViewer from 'react-native-file-viewer'
import RNFS from 'react-native-fs'

import CozyClient from 'cozy-client'
import type { FileDocument } from 'cozy-client/types/types'
import Minilog from 'cozy-minilog'

import {
  addOfflineFileToConfiguration,
  getOfflineFileFromConfiguration,
  updateLastOpened
} from '/app/domain/io.cozy.files/offlineFilesConfiguration'
import {
  getDownloadUrlById,
  getFileById
} from '/app/domain/io.cozy.files/remoteFiles'
import { getInstanceAndFqdnFromClient } from '/libs/client'
import { normalizeFqdn } from '/libs/functions/stringHelpers'
import { t } from '/locales/i18n'

const log = Minilog('📁 Offline Files')

export const getFilesFolder = (client: CozyClient): string => {
  const { fqdn } = getInstanceAndFqdnFromClient(client)

  const normalizedFqdn = normalizeFqdn(fqdn)

  const destinationPath = `${RNFS.DocumentDirectoryPath}/${normalizedFqdn}/Files`

  return destinationPath
}

const ensureFilesFolder = async (client: CozyClient): Promise<void> => {
  await RNFS.mkdir(getFilesFolder(client))
}

export const downloadFile = async (
  file: FileDocument,
  client: CozyClient,
  setDownloadProgress?: (progress: number) => void
): Promise<string> => {
  try {
    log.debug('Download file', file._id)

    await ensureFilesFolder(client)

    const filesFolder = getFilesFolder(client)

    const existingFile = await getOfflineFileFromConfiguration(file._id)

    const remoteFile = await getFileById(client, file._id)

    if (existingFile && existingFile.rev === remoteFile._rev) {
      log.debug(`File ${file._id} already exist, returning existing one`)
      await updateLastOpened(file._id)
      return existingFile.path
    }

    const filename = remoteFile.name

    const downloadURL = await getDownloadUrlById(client, file._id, filename)

    const destinationPath = `${filesFolder}/${filename}`

    const result = await RNFS.downloadFile({
      fromUrl: downloadURL,
      toFile: `${filesFolder}/${filename}`,
      begin: () => undefined,
      progress: res => {
        const progressPercent = res.bytesWritten / res.contentLength
        setDownloadProgress?.(progressPercent)
      },
      progressInterval: 100
    }).promise

    log.debug(`Donload result is ${JSON.stringify(result)}`)

    const { statusCode } = result

    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(`Status code: ${statusCode}`)
    }

    setDownloadProgress?.(0)

    await addOfflineFileToConfiguration({
      id: file._id,
      rev: remoteFile._rev,
      path: destinationPath
    })

    // If the file's new Rev has a new name, we should delete old file version as file path also changed
    if (existingFile && existingFile.path !== destinationPath) {
      await RNFS.unlink(existingFile.path)
    }

    return destinationPath
    // return destinationPath
  } catch (error: unknown) {
    log.error('Something went wrong while downloading file', error)

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      error.message === 'Network request failed'
    ) {
      Alert.alert(
        t('modals.OfflineFileError.title'),
        t('modals.OfflineFileError.body'),
        undefined,
        {
          cancelable: true
        }
      )
    }

    throw error
  }
}

export const downloadFileAndPreview = async (
  file: FileDocument,
  client: CozyClient | undefined
): Promise<null> => {
  if (!client) {
    throw new Error('You must be logged in to use backup feature')
  }

  const filePath = await downloadFile(file, client)

  await FileViewer.open(filePath)

  return null
}
