import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import CozyClient, { useClient } from 'cozy-client'

import { FileMetadata } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { OsReceiveLogger } from '/app/domain/osReceive'
import { useLoadingOverlay } from '/app/view/Loading/LoadingOverlayProvider'
import { useI18n } from '/locales/i18n'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import {
  ShareFilesDependencies,
  ShareFilesPayload,
  ShareFilesIntent
} from '/app/domain/osReceive/models/ShareFiles'

import { PostMeMessageOptions } from 'cozy-intent'

const buildDownloadOptions = (
  fileInfo: FileMetadata
): { url: string; path: string } => {
  const { url, name } = fileInfo

  let destinationName = name

  // For Cozy notes, we change the file extension to .md because it is a more usable format
  if (destinationName.endsWith('.cozy-note')) {
    destinationName = destinationName.replace('.cozy-note', '.md')
  }

  const path = `${RNFS.DocumentDirectoryPath}/${destinationName}`

  return {
    url,
    path
  }
}

const downloadFilesInParallel = async (
  fileInfos: FileMetadata[],
  headers: string
): Promise<string[]> => {
  const fileURIs = await Promise.all(
    fileInfos.map(async fileInfo => {
      const { url, path } = buildDownloadOptions(fileInfo)

      const downloadOptions = {
        fromUrl: url,
        toFile: path,
        headers: {
          Authorization: headers
        }
      }

      const { statusCode } = await RNFS.downloadFile(downloadOptions).promise

      if (statusCode < 200 || statusCode >= 300) {
        throw new Error(`Status code for ${fileInfo.name}: ${statusCode}`)
      }

      return `file://${path}`
    })
  )

  return fileURIs
}

const fetchFileMetadata = async (
  client: CozyClient,
  fileId: string
): Promise<FileMetadata> => {
  const fileUrl = `${client.getStackClient().uri}/files/${fileId}`
  const response = await client
    .getStackClient()
    .fetchJSON<{ data: { attributes: { name: string } } }>('GET', fileUrl)

  return {
    url: `${client.getStackClient().uri}/files/download/${fileId}`,
    name: response.data.attributes.name
  }
}

export const fetchFilesByIds = async (
  client: CozyClient,
  filesIds: string[]
): Promise<void> => {
  try {
    const fileInfos = await Promise.all(
      filesIds.map(fileId => fetchFileMetadata(client, fileId))
    )

    const headers = client.getStackClient().getAuthorizationHeader()

    if (!headers) {
      throw new Error('uploadFileMultiple: token is undefined, aborting')
    }

    const fileURIs = await downloadFilesInParallel(fileInfos, headers)

    await Share.open({ urls: fileURIs })
  } catch (error) {
    // We do not want to log when the user did not share but we want to send it to front end
    if (getErrorMessage(error) === 'User did not share') {
      throw error
    }

    OsReceiveLogger.error('fetchFilesByIds: error', error)
    throw new Error('Failed to fetch file metadata or download files')
  }
}

const intentShareFiles = async (
  dependencies: ShareFilesDependencies,
  filesIds: ShareFilesPayload
): Promise<void> => {
  const { showOverlay, hideOverlay, t, client } = dependencies

  try {
    if (!filesIds.length) throw new Error('No files to share')
    if (!client) throw new Error('Client is undefined')

    showOverlay(t('services.osReceive.shareFiles.downloadingFiles'))

    await fetchFilesByIds(client, filesIds)
  } finally {
    hideOverlay()
  }
}

export const useShareFiles = (): { shareFiles: ShareFilesIntent } => {
  const dependencies = {
    showOverlay: useLoadingOverlay().showOverlay,
    hideOverlay: useLoadingOverlay().hideOverlay,
    t: useI18n().t,
    client: useClient()
  }

  return {
    shareFiles: (_options: PostMeMessageOptions, filesIds) =>
      intentShareFiles(dependencies, filesIds)
  }
}
