/* eslint-disable promise/always-return */
import RNBackgroundUpload, {
  UploadOptions
} from 'react-native-background-upload'

import { Media } from '/app/domain/backup/models/Media'

import type CozyClient from 'cozy-client'

interface UploadMediaResult {
  success: boolean
  data?: object
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
          reject({ success: false, data: error })
        })
        RNBackgroundUpload.addListener('cancelled', uploadId, data => {
          reject({ success: false, data })
        })
        RNBackgroundUpload.addListener('completed', uploadId, data => {
          if (data.responseCode === 201) {
            resolve({ success: true, data })
          } else {
            reject({ success: false, data })
          }
        })
      })
      .catch(e => {
        reject({ status: false, data: e as unknown })
      })
  })
}
