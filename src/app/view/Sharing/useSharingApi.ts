import { useCallback, useMemo } from 'react'

import {
  useSharingDispatch,
  useSharingState
} from '/app/view/Sharing/SharingState'
import { sharingLogger } from '/app/domain/sharing'
import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'
import {
  SharingApi,
  SharingActionType
} from '/app/domain/sharing/models/SharingState'
import { uploadFileWithConflictStrategy } from '/app/domain/upload/services'

import { UploadResult } from 'react-native-fs'

import CozyClient, { useClient } from 'cozy-client'

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

export const useSharingApi = (): SharingApi => {
  const client = useClient()
  const state = useSharingState()
  const dispatch = useSharingDispatch()

  const hasFilesToHandle = useCallback((): Promise<boolean> => {
    sharingLogger.info('hasFilesToHandle', state.filesToUpload)
    return Promise.resolve(state.filesToUpload.length > 0)
  }, [state])

  const getFilesToUpload = useCallback((): Promise<ReceivedFile[]> => {
    sharingLogger.info('getFilesToUpload', state.filesToUpload)
    return Promise.resolve(state.filesToUpload)
  }, [state])

  const uploadFiles = useCallback(
    async (arg: string): Promise<UploadResult | undefined> => {
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
        return
      }

      if (!client) {
        sharingLogger.error('uploadFiles: client is undefined, aborting')
        return
      }

      sharingLogger.info('starting to uploadFile', { fileToUpload })

      return await uploadFileWithConflictStrategy({
        url: getUrl(client, file, fileToUpload),
        token: client.getStackClient().token.accessToken as string,
        filename: fileToUpload.fileName,
        filepath: fileToUpload.filePath,
        mimetype: fileToUpload.mimeType
      })
    },
    [client, state]
  )

  const resetFilesToHandle = useCallback((): Promise<void> => {
    sharingLogger.info('resetFilesToHandle')
    dispatch({ type: SharingActionType.SetRecoveryState })
    return Promise.resolve()
  }, [dispatch])

  return useMemo(
    () => ({
      hasFilesToHandle,
      getFilesToUpload,
      uploadFiles,
      resetFilesToHandle
    }),
    [getFilesToUpload, hasFilesToHandle, resetFilesToHandle, uploadFiles]
  )
}
