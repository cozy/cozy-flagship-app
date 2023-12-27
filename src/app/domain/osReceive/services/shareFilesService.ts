import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import type CozyClient from 'cozy-client'

import { FileMetadata } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { OsReceiveLogger } from '/app/domain/osReceive'

import { getErrorMessage } from 'cozy-intent'

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
  fileIds: string[],
  callback?: () => void
): Promise<void> => {
  try {
    const fileInfos = await Promise.all(
      fileIds.map(fileId => fetchFileMetadata(client, fileId))
    )

    const headers = client.getStackClient().getAuthorizationHeader()

    if (!headers) {
      throw new Error('uploadFileMultiple: token is undefined, aborting')
    }

    const fileURIs = await downloadFilesInParallel(fileInfos, headers)

    // We want to call the callback before opening the share dialog
    // This is to handle the case where the Share library throws an error,
    // which would cause the callback to never be called
    callback?.()

    await Share.open({
      urls: fileURIs
    })
  } catch (error) {
    if (getErrorMessage(error) === 'User did not share') throw error

    OsReceiveLogger.error('fetchFilesByIds: error', error)
    throw new Error('Failed to fetch file metadata or download files')
  }
}
