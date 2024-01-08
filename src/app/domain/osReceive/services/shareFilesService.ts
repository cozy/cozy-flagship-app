import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import CozyClient, { useClient } from 'cozy-client'

import { FileMetadata } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { OsReceiveLogger } from '/app/domain/osReceive'
import { useLoadingOverlay } from '/app/view/Loading/LoadingOverlayProvider'
import { useError } from '/app/view/Error/ErrorProvider'
import { useI18n } from '/locales/i18n'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import {
  ShareFilesDependencies,
  ShareFilesPayload,
  ShareFilesIntent
} from '/app/domain/osReceive/models/ShareFiles'

const downloadFilesInParallel = async (
  fileInfos: FileMetadata[],
  headers: string
): Promise<string[]> => {
  const fileURIs = await Promise.all(
    fileInfos.map(async fileInfo => {
      const { url, name } = fileInfo
      const filename = `${name}`
      const path = `${RNFS.DocumentDirectoryPath}/${filename}`

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
    // Not considered as an error
    if (getErrorMessage(error) === 'User did not share') return

    OsReceiveLogger.error('fetchFilesByIds: error', error)
    throw new Error('Failed to fetch file metadata or download files')
  }
}

const intentShareFiles = async (
  dependencies: ShareFilesDependencies,
  filesIds: ShareFilesPayload
): Promise<void> => {
  const { showOverlay, hideOverlay, handleError, t, client } = dependencies

  try {
    if (!filesIds.length) throw new Error('No files to share')
    if (!client) throw new Error('Client is undefined')

    showOverlay(t('services.osReceive.shareFiles.downloadingFiles'))

    await fetchFilesByIds(client, filesIds)
  } catch (error) {
    handleError(
      t('errors.shareFiles', {
        postProcess: 'interval',
        count: filesIds.length
      })
    )
  } finally {
    hideOverlay()
  }
}

export const useShareFiles = (): { shareFiles: ShareFilesIntent } => {
  const dependencies = {
    showOverlay: useLoadingOverlay().showOverlay,
    hideOverlay: useLoadingOverlay().hideOverlay,
    handleError: useError().handleError,
    t: useI18n().t,
    client: useClient()
  }

  return {
    shareFiles: filesIds => intentShareFiles(dependencies, filesIds)
  }
}
