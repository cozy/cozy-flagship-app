import { Dispatch } from 'react'
import Toast from 'react-native-toast-message'

import CozyClient from 'cozy-client'

import { OsReceiveLogger } from '/app/domain/osReceive'
import { uploadFileWithConflictStrategy } from '/app/domain/upload/services/index'
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
import { IncomingFile } from '/app/domain/osReceive/models/ReceivedFile'

import { NativeService } from 'cozy-intent'

const getUrl = (
  client: CozyClient,
  file: { fileOptions: { dirId: string; name: string } }
): string => {
  const createdAt = new Date().toISOString()
  const modifiedAt = new Date().toISOString()

  const toURL = new URL(client.getStackClient().uri)
  toURL.pathname = `/files/${file.fileOptions.dirId}`
  toURL.searchParams.append('Name', file.fileOptions.name)
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
    }
  }

  return state.filesToUpload.filter(
    file => file.status === OsReceiveFileStatus.queued
  )
}

const uploadFileMultiple = async (
  arg: string,
  state: OsReceiveState,
  client: CozyClient,
  dispatch: Dispatch<OsReceiveAction>
): Promise<void> => {
  const files = JSON.parse(arg) as IncomingFile[]
  const token = client.getStackClient().token.accessToken

  if (!token) {
    throw new Error('uploadFileMultiple: token is undefined, aborting')
  }

  for (const file of files) {
    try {
      const fileToUpload = state.filesToUpload.find(
        fileToUpload => fileToUpload.name === file.fileOptions.name
      )

      if (!fileToUpload) {
        throw new Error(
          'uploadFileMultiple: fileToUpload is undefined, aborting'
        )
      }

      if (!file.fileOptions.dirId) {
        throw new Error('uploadFileMultiple: dirId is undefined, aborting')
      }

      OsReceiveLogger.info('starting to uploadFileMultiple', { fileToUpload })

      const url = getUrl(client, file)

      await uploadFileWithConflictStrategy({
        url,
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
      OsReceiveLogger.error('uploadFileMultiple: error', error)

      Toast.show({
        text1: t('services.osReceive.errors.uploadFailed', {
          filename: file.fileOptions.name
        }),
        type: 'error'
      })

      dispatch({
        type: OsReceiveActionType.UpdateFileStatus,
        payload: {
          name: file.fileOptions.name,
          status: OsReceiveFileStatus.error,
          handledTimestamp: Date.now()
        }
      })
    }
  }
}

const uploadFiles = (
  arg: string,
  state: OsReceiveState,
  client: CozyClient,
  dispatch: Dispatch<OsReceiveAction>
): boolean => {
  OsReceiveLogger.info('uploadFiles called')

  uploadFileMultiple(arg, state, client, dispatch)
    .then(() => {
      return OsReceiveLogger.info('uploadFiles ended without errors')
    })
    .catch(error => {
      OsReceiveLogger.error('uploadFiles: error', error)
    })

  return true
}

const resetFilesToHandle = (
  dispatch: Dispatch<OsReceiveAction>
): Promise<boolean> => {
  OsReceiveLogger.info('resetFilesToHandle called')
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

// The osReceiveScreen should display again if every file is in toUpload state with no timestamp.
// Note that this function assumes it is not possible to have files already handled when it is called.
// Meaning, if it's called wrongly after some files already were uploaded, it will set them up again to upload.
const cancelUploadByCozyApp = (
  dispatch: Dispatch<OsReceiveAction>
): boolean => {
  OsReceiveLogger.info('cancelUploadByCozyApp called')

  dispatch({
    type: OsReceiveActionType.UpdateFileStatus,
    payload: {
      name: '*',
      status: OsReceiveFileStatus.toUpload,
      handledTimestamp: undefined
    }
  })

  navigate(routes.home)

  return true
}

export const isFileHandled = (file: OsReceiveFile): boolean =>
  file.status === OsReceiveFileStatus.uploaded ||
  file.status === OsReceiveFileStatus.error

export const getMostRecentFile = (
  recentFile: OsReceiveFile,
  currentFile: OsReceiveFile
): OsReceiveFile =>
  !recentFile.handledTimestamp ||
  (currentFile.handledTimestamp &&
    currentFile.handledTimestamp > recentFile.handledTimestamp)
    ? currentFile
    : recentFile

export const findMostRecentlyHandledFile = (
  filesToUpload: OsReceiveFile[]
): OsReceiveFile | null => {
  const handledFiles = filesToUpload.filter(isFileHandled)
  if (handledFiles.length > 0) {
    return handledFiles.reduce(getMostRecentFile)
  }
  return null
}

export const sendMessageForFile = async (
  file: OsReceiveFile,
  routeToUpload: OsReceiveState['routeToUpload'],
  nativeIntent: NativeService,
  dispatch: Dispatch<OsReceiveAction>
): Promise<void> => {
  try {
    if (!routeToUpload.href) throw new Error('No route to upload')

    await nativeIntent.call(routeToUpload.href, 'onFileUploaded', file)
  } catch (error) {
    OsReceiveLogger.error('sendMessageForFile error', error)

    dispatch({
      type: OsReceiveActionType.SetFlowErrored,
      payload: true
    })
  }
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
  cancelUploadByCozyApp: () => cancelUploadByCozyApp(dispatch)
})
