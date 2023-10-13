import { Dispatch } from 'react'
import Toast from 'react-native-toast-message'

import CozyClient from 'cozy-client'

import { OsReceiveLogger } from '/app/domain/osReceive'
import { uploadFileWithConflictStrategy } from '/app/domain/upload/services/index'
import { IncomingFile } from '/app/domain/osReceive/models/ReceivedFile'
import {
  OsReceiveState,
  OsReceiveAction,
  OsReceiveActionType,
  OsReceiveApiMethods,
  UploadStatus,
  OsReceiveFile,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import { t } from '/locales/i18n'
import { getBase64FromReceivedFile } from '/app/domain/osReceive/services/OsReceiveData'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'

const getUrl = (
  client: CozyClient,
  file: { fileOptions: { dirId: string } },
  fileToUpload: OsReceiveFile
): string => {
  const createdAt = new Date().toISOString()
  const modifiedAt = new Date().toISOString()

  const toURL = new URL(client.getStackClient().uri)
  toURL.pathname = `/files/${file.fileOptions.dirId}`
  toURL.searchParams.append('Name', fileToUpload.name)
  toURL.searchParams.append('Type', 'file')
  toURL.searchParams.append('Tags', 'library')
  toURL.searchParams.append('Executable', 'false')
  toURL.searchParams.append('CreatedAt', createdAt)
  toURL.searchParams.append('UpdatedAt', modifiedAt)

  return toURL.toString()
}

const getFilesToHandle = async (
  base64: boolean,
  state: OsReceiveState
): Promise<OsReceiveFile[]> => {
  OsReceiveLogger.info('getFilesToHandle called', { base64 })

  if (base64) {
    for (const file of state.filesToUpload) {
      const base64File = await getBase64FromReceivedFile(file.file.filePath)
      if (!base64File) throw new Error('getFilesToHandle: base64File is null')
      file.source = base64File
      file.type = file.file.mimeType
      OsReceiveLogger.info(state.filesToUpload)
    }
  }

  return state.filesToUpload.filter(
    file => file.status === OsReceiveFileStatus.queued
  )
}

const uploadFiles = async (
  arg: string,
  state: OsReceiveState,
  client: CozyClient | null,
  dispatch: Dispatch<OsReceiveAction>
): Promise<void> => {
  const file = JSON.parse(arg) as IncomingFile
  const fileToUpload = state.filesToUpload.find(
    fileToUpload => fileToUpload.name === file.fileOptions.name
  )

  if (!fileToUpload) {
    return OsReceiveLogger.error(
      'uploadFiles: fileToUpload is undefined, aborting'
    )
  }

  if (!client) {
    return OsReceiveLogger.error('uploadFiles: client is undefined, aborting')
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
      filename: fileToUpload.name,
      filepath: fileToUpload.file.filePath,
      mimetype: fileToUpload.file.mimeType
    })

    dispatch({
      type: OsReceiveActionType.UpdateFileStatus,
      payload: {
        name: fileToUpload.name,
        status: OsReceiveFileStatus.uploaded,
        handledTimestamp: Date.now()
      }
    })
  } catch (error) {
    OsReceiveLogger.error('uploadFiles: error', error)

    Toast.show({
      text1: t('services.osReceive.errors.uploadFailed', {
        filename: fileToUpload.name
      }),
      type: 'error'
    })

    dispatch({
      type: OsReceiveActionType.UpdateFileStatus,
      payload: {
        name: fileToUpload.name,
        status: OsReceiveFileStatus.error,
        handledTimestamp: Date.now()
      }
    })
  }
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

  const uploadStatus = {
    filesToHandle: state.filesToUpload.filter(
      file => file.status === OsReceiveFileStatus.uploading
    )
  }

  OsReceiveLogger.info('getUploadStatus', { uploadStatus })

  return Promise.resolve(uploadStatus)
}

export const OsReceiveApi = (
  client: CozyClient,
  state: OsReceiveState,
  dispatch: Dispatch<OsReceiveAction>
): OsReceiveApiMethods => ({
  hasFilesToHandle: () => hasFilesToHandle(state),
  getFilesToHandle: (base64 = false) => getFilesToHandle(base64, state),
  uploadFiles: arg => uploadFiles(arg, state, client, dispatch),
  resetFilesToHandle: () => resetFilesToHandle(dispatch),
  cancelUploadByCozyApp: (): boolean => {
    navigate(routes.home)
    return true
  }
})
