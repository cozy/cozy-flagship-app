import { getMimeType } from '/app/domain/backup/services/getMedias'
import { Media } from '/app/domain/backup/models/Media'
import { t } from '/locales/i18n'

import CozyClient from 'cozy-client'

import { uploadFileWithRetryAndConflictStrategy } from '/app/domain/upload/services'
import { UploadResult } from '/app/domain/upload/models'
import { shouldRetryCallbackBackup } from '/app/domain/backup/helpers/error'

export const uploadMedia = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadResult> => {
  const filepath = media.path.replace('file://', '')

  return uploadFileWithRetryAndConflictStrategy({
    url: uploadUrl,
    token: client.getStackClient().token.accessToken!,
    filename: media.name,
    filepath,
    mimetype: getMimeType(media),
    notification: {
      onProgressTitle: t('services.backup.notifications.onProgressTitle'),
      onProgressMessage: t('services.backup.notifications.onProgressMessage', {
        filename: media.name
      })
    },
    retry: {
      nRetry: 1,
      shouldRetryCallback: shouldRetryCallbackBackup
    }
  })
}
