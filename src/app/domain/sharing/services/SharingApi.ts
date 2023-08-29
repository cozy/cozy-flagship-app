import { Dispatch } from 'react'

import CozyClient from 'cozy-client'

import { sharingLogger } from '/app/domain/sharing'
import { uploadFileWithConflictStrategy } from '/app/domain/upload/services/index'
import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'
import {
  SharingState,
  SharingAction,
  SharingActionType,
  SharingApi
} from '/app/domain/sharing/models/SharingState'

const getUrl = (
  client: CozyClient,
  file: { fileOptions: { dirId: string } },
  fileToUpload: ReceivedFile
): string => {
  const createdAt = new Date().toISOString()
  const modifiedAt = new Date().toISOString()

  const toURL = new URL(client.getStackClient().uri)
  toURL.pathname = `/files/${file.fileOptions.dirId}`
  toURL.searchParams.append('Name', fileToUpload.fileName)
  toURL.searchParams.append('Type', 'file')
  toURL.searchParams.append('Tags', 'library')
  toURL.searchParams.append('Executable', 'false')
  toURL.searchParams.append('CreatedAt', createdAt)
  toURL.searchParams.append('UpdatedAt', modifiedAt)

  return toURL.toString()
}

const hasFilesToHandle = async (state: SharingState): Promise<boolean> => {
  sharingLogger.info('hasFilesToHandle', state.filesToUpload)
  return Promise.resolve(state.filesToUpload.length > 0)
}

const getFilesToUpload = async (
  state: SharingState
): Promise<ReceivedFile[]> => {
  sharingLogger.info('getFilesToUpload', state.filesToUpload)
  return Promise.resolve(state.filesToUpload)
}

const uploadFiles = async (
  arg: string,
  state: SharingState,
  client: CozyClient | null,
  dispatch: Dispatch<SharingAction>
): Promise<boolean> => {
  interface IncomingFile {
    fileOptions: {
      name: string
      dirId: string
      conflictStrategy: string
    }
  }

  const file = JSON.parse(arg) as IncomingFile
  const fileToUpload = state.filesToUpload.find(
    fileToUpload => fileToUpload.fileName === file.fileOptions.name
  )

  if (!fileToUpload) {
    sharingLogger.error('uploadFiles: fileToUpload is undefined, aborting')
    return false
  }

  if (!client) {
    sharingLogger.error('uploadFiles: client is undefined, aborting')
    return false
  }

  sharingLogger.info('starting to uploadFile', { fileToUpload })

  try {
    const token = client.getStackClient().token.accessToken

    if (!token) {
      throw new Error('uploadFiles: token is undefined, aborting')
    }

    await uploadFileWithConflictStrategy({
      url: getUrl(client, file, fileToUpload),
      token,
      filename: fileToUpload.fileName,
      filepath: fileToUpload.filePath,
      mimetype: fileToUpload.mimeType
    })
  } catch (error) {
    sharingLogger.error('uploadFiles: error', error)
  }

  dispatch({ type: SharingActionType.SetFileUploaded, payload: fileToUpload })
  return true
}

const resetFilesToHandle = (
  dispatch: Dispatch<SharingAction>
): Promise<boolean> => {
  sharingLogger.info('resetFilesToHandle')
  setTimeout(() => dispatch({ type: SharingActionType.SetRecoveryState }), 0)
  return Promise.resolve(true)
}

export const sharingApi = (
  client: CozyClient,
  state: SharingState,
  dispatch: Dispatch<SharingAction>
): SharingApi => ({
  hasFilesToHandle: () => hasFilesToHandle(state),
  getFilesToUpload: () => getFilesToUpload(state),
  uploadFiles: arg => uploadFiles(arg, state, client, dispatch),
  resetFilesToHandle: () => resetFilesToHandle(dispatch)
})
