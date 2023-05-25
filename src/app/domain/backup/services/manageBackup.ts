import Minilog from '@cozy/minilog'

import { managePermissions } from '/app/domain/backup/services/managePermissions'
import {
  hasLocalBackupConfig,
  initiazeLocalBackupConfig
} from '/app/domain/backup/services/manageLocalBackupConfig'
import { getMediasToBackup } from '/app/domain/backup/services/getMedias'
import { uploadMedias } from '/app/domain/backup/services/uploadMedias'

import type CozyClient from 'cozy-client'

const log = Minilog('💿 Backup')

export const startBackup = async (client: CozyClient): Promise<void> => {
  log.debug('Backup started')

  await managePermissions()

  await initializeBackup(client)

  const mediasToBackup = await getMediasToBackup(client)
  log.debug(`${mediasToBackup.length} medias to backup`)

  await uploadMedias(client, mediasToBackup)

  log.debug('Backup finished')
}

const initializeBackup = async (client: CozyClient): Promise<void> => {
  const hasLocalBackup = await hasLocalBackupConfig(client)

  if (!hasLocalBackup) {
    await initiazeLocalBackupConfig(client)
  }
}
