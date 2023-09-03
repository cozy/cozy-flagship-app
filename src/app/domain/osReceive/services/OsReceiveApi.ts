import { Dispatch } from 'react'

import CozyClient from 'cozy-client'

import { OsReceiveLogger } from '/app/domain/osReceive'
import { uploadFileWithConflictStrategy } from '/app/domain/upload/services/index'
import {
  IncomingFile,
  ReceivedFile
} from '/app/domain/osReceive/models/ReceivedFile'
import {
  OsReceiveState,
  OsReceiveAction,
  OsReceiveActionType,
  OsReceiveApiMethods,
  UploadStatus
} from '/app/domain/osReceive/models/OsReceiveState'

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

const getFilesToUpload = async (
  state: OsReceiveState
): Promise<ReceivedFile[]> => {
  OsReceiveLogger.info('getFilesToUpload', state.filesToUpload)
  return Promise.resolve(state.filesToUpload)
}

const uploadFiles = async (
  arg: string,
  state: OsReceiveState,
  client: CozyClient | null,
  dispatch: Dispatch<OsReceiveAction>
): Promise<boolean> => {
  const file = JSON.parse(arg) as IncomingFile
  const fileToUpload = state.filesToUpload.find(
    fileToUpload => fileToUpload.fileName === file.fileOptions.name
  )

  if (!fileToUpload) {
    OsReceiveLogger.error('uploadFiles: fileToUpload is undefined, aborting')
    return false
  }

  if (!client) {
    OsReceiveLogger.error('uploadFiles: client is undefined, aborting')
    return false
  }

  OsReceiveLogger.info('starting to uploadFile', { fileToUpload })

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
    OsReceiveLogger.error('uploadFiles: error', error)

    dispatch({
      type: OsReceiveActionType.SetFileUploadFailed,
      payload: { ...fileToUpload, ...file.fileOptions }
    })

    return false
  }

  dispatch({
    type: OsReceiveActionType.SetFileUploaded,
    payload: { ...fileToUpload, ...file.fileOptions }
  })

  return true
}

const resetFilesToHandle = (
  dispatch: Dispatch<OsReceiveAction>
): Promise<boolean> => {
  OsReceiveLogger.info('resetFilesToHandle')
  setTimeout(() => dispatch({ type: OsReceiveActionType.SetRecoveryState }), 0)
  return Promise.resolve(true)
}

const hasFilesToHandle = async (
  state: OsReceiveState
): Promise<UploadStatus> => {
  OsReceiveLogger.info('getUploadStatus called')

  const uploadStatus = { filesToHandle: state.filesToUpload }

  OsReceiveLogger.info('getUploadStatus', { uploadStatus })

  return Promise.resolve(uploadStatus)
}

export const OsReceiveApi = (
  client: CozyClient,
  state: OsReceiveState,
  dispatch: Dispatch<OsReceiveAction>
): OsReceiveApiMethods => ({
  hasFilesToHandle: () => hasFilesToHandle(state),
  getFilesToUpload: () => getFilesToUpload(state),
  uploadFiles: arg => uploadFiles(arg, state, client, dispatch),
  resetFilesToHandle: () => resetFilesToHandle(dispatch)
})
