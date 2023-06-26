/* eslint-disable promise/always-return */
import Minilog from '@cozy/minilog'

import { uploadMedia } from '/app/domain/backup/services/uploadMedia'
import { setMediaAsBackuped } from '/app/domain/backup/services/manageLocalBackupConfig'
import { Media, ProgressCallback } from '/app/domain/backup/models'
import { getBackupInfo } from '/app/domain/backup/services/manageBackup'

import type CozyClient from 'cozy-client'

const log = Minilog('💿 Backup')

export const uploadMedias = async (
  client: CozyClient,
  backupFolderId: string,
  mediasToUpload: Media[],
  onProgress: ProgressCallback
): Promise<boolean> => {
  for (const mediaToUpload of mediasToUpload) {
    try {
      const uploadUrl = getUploadUrl(client, backupFolderId, mediaToUpload)

      const { success } = await uploadMedia(client, uploadUrl, mediaToUpload)

      if (success) {
        log.debug(`✅ ${mediaToUpload.name} uploaded`)
        await setMediaAsBackuped(client, mediaToUpload)

        onProgress(await getBackupInfo(client))
      } else {
        log.debug(`❌ ${mediaToUpload.name} not uploaded`)
      }
    } catch (e) {
      log.debug(`❌ ${mediaToUpload.name} not uploaded`)
      log.debug(e)
    }
  }

  return true
}

const getUploadUrl = (
  client: CozyClient,
  backupFolderId: string,
  media: Media
): string => {
  const createdAt = new Date(media.creationDate).toISOString()

  const toURL =
    client.getStackClient().uri +
    '/files/' +
    backupFolderId +
    '?Name=' +
    encodeURIComponent(media.name) +
    '&Type=file&Tags=library&Executable=false&CreatedAt=' +
    createdAt +
    '&UpdatedAt=' +
    createdAt

  return toURL
}
