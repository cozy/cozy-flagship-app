/* eslint-disable promise/always-return */
import RNBackgroundUpload, {
  UploadOptions
} from 'react-native-background-upload'

import { StackErrors, IOCozyFile } from 'cozy-client'

import { UploadParams, UploadResult } from '/app/domain/upload/models'

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
  filepath,
  mimetype,
  notification
}: UploadParams): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      path: filepath,
      method: 'POST',
      type: 'raw',
      maxRetries: 0,
      headers: {
        Accept: 'application/json',
        'Content-Type': mimetype,
        Authorization: `Bearer ${token}`
      },
      notification: {
        enabled: true,
        autoClear: true,
        ...notification
      }
    } as UploadOptions

    RNBackgroundUpload.startUpload(options)
      .then(uploadId => {
        setCurrentUploadId(uploadId)

        RNBackgroundUpload.addListener('error', uploadId, error => {
          if (error.responseCode && error.responseBody) {
            const { errors } = JSON.parse(error.responseBody) as StackErrors
            reject({
              statusCode: error.responseCode,
              errors
            })
          } else {
            reject({
              statusCode: -1,
              errors: [
                {
                  status: -1,
                  title: error.error,
                  detail: error.error
                }
              ]
            })
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        RNBackgroundUpload.addListener('cancelled', uploadId, data => {
          reject({
            statusCode: -1,
            errors: [
              {
                status: -1,
                title: 'Upload cancelled',
                detail: 'Upload cancelled'
              }
            ]
          })
        })
        RNBackgroundUpload.addListener('completed', uploadId, response => {
          const { data } = JSON.parse(response.responseBody) as {
            data: IOCozyFile
          }

          if (response.responseCode === 201) {
            resolve({
              statusCode: response.responseCode,
              data
            })
          } else {
            reject({
              statusCode: response.responseCode,
              data
            })
          }
        })
      })
      .catch(e => {
        reject(e)
      })
  })
}

export const cancelUpload = (uploadId: string): Promise<boolean> => {
  return RNBackgroundUpload.cancelUpload(uploadId)
}
