/* eslint-disable promise/always-return */
import RNBackgroundUpload, {
  UploadOptions
} from 'react-native-background-upload'

import { getMimeType } from '/app/domain/backup/services/getMedias'
import { Media, UploadMediaResult } from '/app/domain/backup/models/Media'

import CozyClient, { StackErrors, IOCozyFile } from 'cozy-client'

let currentUploadId: string | undefined

export const getCurrentUploadId = (): string | undefined => {
  return currentUploadId
}

const setCurrentUploadId = (value: string): void => {
  currentUploadId = value
}

export const uploadMedia = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadMediaResult> => {
  const filepath = media.path.replace('file://', '')

  return new Promise((resolve, reject) => {
    const options = {
      url: uploadUrl,
      path: filepath,
      method: 'POST',
      type: 'raw',
      headers: {
        Accept: 'application/json',
        'Content-Type': getMimeType(media),
        Authorization: `Bearer ${
          // @ts-expect-error Type issue which will be fixed in another PR
          client.getStackClient().token.accessToken as string
        }`
      },
      notification: {
        enabled: true,
        autoClear: true
      }
    } as UploadOptions

    RNBackgroundUpload.startUpload(options)
      .then(uploadId => {
        setCurrentUploadId(uploadId)

        RNBackgroundUpload.addListener('error', uploadId, error => {
          const { errors } = JSON.parse(error.responseBody) as StackErrors
          reject({
            statusCode: error.responseCode,
            errors
          })
        })
        RNBackgroundUpload.addListener('cancelled', uploadId, data => {
          reject({ success: false, data })
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
