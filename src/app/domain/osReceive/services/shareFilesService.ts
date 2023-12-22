import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import type CozyClient from 'cozy-client'

import { FileMetadata } from '/app/domain/osReceive/models/Files'

const downloadFilesInParallel = async (
  fileInfos: FileMetadata[],
  token: string
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
          Authorization: `Bearer ${token}`
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
  fileIds: string[]
): Promise<void> => {
  try {
    const fileInfos = await Promise.all(
      fileIds.map(fileId => fetchFileMetadata(client, fileId))
    )

    const authToken = client.getStackClient().token.accessToken

    if (!authToken) {
      throw new Error('uploadFileMultiple: token is undefined, aborting')
    }

    const fileURIs = await downloadFilesInParallel(fileInfos, authToken)

    await Share.open({
      urls: fileURIs
    })
  } catch (error) {
    throw new Error('Failed to fetch file metadata or download files')
  }
}
