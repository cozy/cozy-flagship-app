import { getMimeType } from '/app/domain/backup/services/getMedias'
import { Media } from '/app/domain/backup/models/Media'
import { t } from '/locales/i18n'

import CozyClient from 'cozy-client'

import { uploadFileWithConflictStrategy } from '/app/domain/upload/services'
import { UploadResult } from '/app/domain/upload/models'

export const uploadMedia = async (
  client: CozyClient,
  uploadUrl: string,
  media: Media
): Promise<UploadResult> => {
  const filepath = media.path.replace('file://', '')

  return uploadFileWithConflictStrategy({
    url: uploadUrl,
    // @ts-expect-error Type issue which will be fixed in another PR
    token: client.getStackClient().token.accessToken as string,
    filename: media.name,
    filepath,
    mimetype: getMimeType(media),
    notification: {
      onProgressTitle: t('services.backup.notifications.onProgressTitle'),
      onProgressMessage: t('services.backup.notifications.onProgressMessage', {
        filename: media.name
      })
    }
  })
}
