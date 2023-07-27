/* eslint-disable promise/always-return */
import RNBackgroundUpload, {
  UploadOptions
} from 'react-native-background-upload'

import { getMimeType } from '/app/domain/backup/services/getMedias'
import { Media, UploadMediaResult } from '/app/domain/backup/models/Media'
import { t } from '/locales/i18n'

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
      maxRetries: 0,
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
        autoClear: true,
        onProgressTitle: t('services.backup.notifications.onProgressTitle'),
        onProgressMessage: t(
          'services.backup.notifications.onProgressMessage',
          {
            filename: media.name
          }
        ),
        onCompleteTitle: t('services.backup.notifications.onCompleteTitle'),
        onCompleteMessage: t(
          'services.backup.notifications.onCompleteMessage',
          {
            filename: media.name
          }
        ),
        onErrorTitle: t('services.backup.notifications.onErrorTitle'),
        onErrorMessage: t('services.backup.notifications.onErrorMessage', {
          filename: media.name
        }),
        onCancelledTitle: t('services.backup.notifications.onCancelledTitle'),
        onCancelledMessage: t(
          'services.backup.notifications.onCancelledMessage',
          {
            filename: media.name
          }
        )
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
