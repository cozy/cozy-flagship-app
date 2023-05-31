import Minilog from '@cozy/minilog'

import { managePermissions } from '/app/domain/backup/services/managePermissions'
import {
  getLocalBackupConfig,
  hasLocalBackupConfig,
  initiazeLocalBackupConfig,
  setBackupAsDone
} from '/app/domain/backup/services/manageLocalBackupConfig'
import { getMediasToBackup } from '/app/domain/backup/services/getMedias'
import { uploadMedias } from '/app/domain/backup/services/uploadMedias'

import type CozyClient from 'cozy-client'

import { BackupInfo } from '/app/domain/backup/models'

const log = Minilog('💿 Backup')

export const startBackup = async (client: CozyClient): Promise<void> => {
  log.debug('Backup started')

  await managePermissions()

  await initializeBackup(client)

  const mediasToBackup = await getMediasToBackup(client)
  log.debug(`${mediasToBackup.length} medias to backup`)

  await uploadMedias(client, mediasToBackup)

  await setBackupAsDone(client)

  log.debug('Backup finished')
}

export const getBackupInfo = async (
  client: CozyClient
): Promise<BackupInfo> => {
  const backupConfig = await getLocalBackupConfig(client)

  return {
    lastBackupDate: backupConfig.lastBackupDate,
    backupedMediasCount: backupConfig.backupedMedias.length
  }
}

const initializeBackup = async (client: CozyClient): Promise<void> => {
  const hasLocalBackup = await hasLocalBackupConfig(client)

  if (!hasLocalBackup) {
    await initiazeLocalBackupConfig(client)
  }
}
