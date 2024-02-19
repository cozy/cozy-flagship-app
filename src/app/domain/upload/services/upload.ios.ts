/* eslint-disable promise/always-return */
import RNFileSystem from 'react-native-fs'

import { StackErrors, IOCozyFile } from 'cozy-client'

import {
  UploadParams,
  UploadResult,
  NetworkError,
  CancellationError
} from '/app/domain/upload/models'

let currentUploadId: string | undefined

export const getCurrentUploadId = (): string | undefined => {
  return currentUploadId
}

const setCurrentUploadId = (value: string): void => {
  currentUploadId = value
}

export const uploadFile = async ({
  url,
  token,
  filename,
  filepath,
  mimetype
}: UploadParams): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const { jobId, promise } = RNFileSystem.uploadFiles({
      toUrl: url,
      files: [
        {
          name: filename,
          filename,
          // We need to remove the file:// prefix or the upload will be empty but successful (silent error)
          // Doing it at the last moment is preferrable to avoid breaking other platforms or side effects
          filepath: filepath.startsWith('file://')
            ? filepath.replace('file://', '')
            : filepath,
          filetype: mimetype
        }
      ],
      binaryStreamOnly: true,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': mimetype,
        Authorization: `Bearer ${token}`
      }
    })

    setCurrentUploadId(jobId.toString())

    // Start the upload
    promise
      .then(response => {
        if (response.body === '' && !response.statusCode) {
          return reject(new NetworkError())
        }

        if (response.statusCode == 201) {
          const { data } = JSON.parse(response.body) as {
            data: IOCozyFile
          }
          return resolve({
            statusCode: response.statusCode,
            data
          })
        } else {
          const { errors } = JSON.parse(response.body) as StackErrors

          return reject({
            statusCode: response.statusCode,
            errors
          })
        }
      })
      .catch(e => {
        if ((e as Error).message === 'Task was cancelled') {
          return reject(new CancellationError())
        }
        return reject(e)
      })
  })
}

export const cancelUpload = (uploadId: string): Promise<void> => {
  return new Promise(resolve => {
    resolve(RNFileSystem.stopUpload(parseInt(uploadId)))
  })
}
