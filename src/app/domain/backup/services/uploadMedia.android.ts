/* eslint-disable promise/always-return */
import RNBackgroundUpload, {
  UploadOptions
} from 'react-native-background-upload'

import { Media, UploadMediaResult } from '/app/domain/backup/models/Media'

import CozyClient, { IOCozyFile } from 'cozy-client'

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
        'Content-Type': media.type,
        Authorization: `Bearer ${
          // @ts-expect-error Type issue which will be fixed in another PR
          client.getStackClient().token.accessToken as string
        }`
      },
      notification: {
        enabled: false
      }
    } as UploadOptions

    RNBackgroundUpload.startUpload(options)
      .then(uploadId => {
        RNBackgroundUpload.addListener('error', uploadId, error => {
          // RNBackgroundUpload does not return status code and response body...
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