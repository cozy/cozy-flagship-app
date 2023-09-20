import { uploadFile } from '/app/domain/upload/services/upload'
import {
  UploadError,
  UploadParams,
  UploadResult
} from '/app/domain/upload/models'

export { uploadFile }

import { SplitFilenameResult, models } from 'cozy-client'
import { IOCozyFile } from 'cozy-client/types/types'
import Minilog from 'cozy-minilog'

const log = Minilog('💿 Backup')

export const uploadFileWithRetryAndConflictStrategy = async ({
  url,
  token,
  filename,
  filepath,
  mimetype,
  notification,
  conflictOptions,
  retry
}: UploadParams): Promise<UploadResult> => {
  try {
    return await uploadFileWithConflictStrategy({
      url,
      token,
      filename,
      filepath,
      mimetype,
      notification,
      conflictOptions,
      retry
    })
  } catch (e) {
    const error = e as Error

    const shouldRetry =
      retry && retry.nRetry > 0 && retry.shouldRetryCallback(error)

    if (shouldRetry) {
      log.debug(
        `Retry upload of ${filename} (${filepath}) because got ${JSON.stringify(
          error
        )}`
      )

      await new Promise(resolve => setTimeout(resolve, 1000))

      return await uploadFileWithRetryAndConflictStrategy({
        url,
        token,
        filename,
        filepath,
        mimetype,
        notification,
        conflictOptions,
        retry: {
          nRetry: retry.nRetry - 1,
          shouldRetryCallback: retry.shouldRetryCallback
        }
      })
    }

    throw e
  }
}

export const uploadFileWithConflictStrategy = async ({
  url,
  token,
  filename,
  filepath,
  mimetype,
  notification,
  conflictOptions
}: UploadParams): Promise<UploadResult> => {
  try {
    return await uploadFile({
      url,
      token,
      filename,
      filepath,
      mimetype,
      notification
    })
  } catch (e) {
    const error = e as UploadError

    if (error.statusCode === 409) {
      const urlWithNewName = new URL(url)

      const oldName = urlWithNewName.searchParams.get('Name')

      const { filename, extension } = models.file.splitFilename({
        type: 'file',
        name: oldName
      } as IOCozyFile) as SplitFilenameResult

      const newName =
        models.file.generateNewFileNameOnConflict(
          filename,
          conflictOptions?.originalNameFormatRegex
        ) + extension

      urlWithNewName.searchParams.set('Name', newName)

      log.debug(
        `Retry upload of ${filename} (${filepath}) because conflict (new name ${newName})`
      )

      return await uploadFileWithConflictStrategy({
        url: urlWithNewName.toString(),
        token,
        filename,
        filepath,
        mimetype,
        notification,
        conflictOptions
      })
    }

    throw e
  }
}
