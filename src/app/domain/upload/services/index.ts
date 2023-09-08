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
      retry
    })
  } catch (e) {
    const error = e as Error

    const shouldRetry =
      retry && retry.nRetry > 0 && retry.shouldRetryCallback(error)

    if (shouldRetry) {
      log.debug(
        `Retry upload of ${filepath} because got ${JSON.stringify(error)}`
      )

      await new Promise(resolve => setTimeout(resolve, 1000))

      return await uploadFileWithRetryAndConflictStrategy({
        url,
        token,
        filename,
        filepath,
        mimetype,
        notification,
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
  notification
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

      const { filename } = models.file.splitFilename({
        type: 'file',
        name: oldName
      } as IOCozyFile) as SplitFilenameResult

      const newName = models.file.generateNewFileNameOnConflict(filename)

      urlWithNewName.searchParams.set('Name', newName)

      return await uploadFileWithConflictStrategy({
        url: urlWithNewName.toString(),
        token,
        filename,
        filepath,
        mimetype,
        notification
      })
    }

    throw e
  }
}
