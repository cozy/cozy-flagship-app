import Minilog from '@cozy/minilog'

import { managePermissions } from '/app/domain/backup/services/managePermissions'
import {
  getLocalBackupConfig,
  initiazeLocalBackupConfig,
  setBackupAsInitializing,
  setBackupAsReady,
  setBackupAsRunning,
  setBackupAsDone
} from '/app/domain/backup/services/manageLocalBackupConfig'
import { getMediasToBackup } from '/app/domain/backup/services/getMedias'
import { uploadMedias } from '/app/domain/backup/services/uploadMedias'
import {
  fetchDeviceRemoteBackupConfig,
  fetchBackupedMedias,
  createRemoteBackupFolder
} from '/app/domain/backup/services/manageRemoteBackupConfig'

import type CozyClient from 'cozy-client'

import {
  BackupInfo,
  BackupedMedia,
  LocalBackupConfig
} from '/app/domain/backup/models'

const log = Minilog('💿 Backup')

export const prepareBackup = async (
  client: CozyClient
): Promise<BackupInfo> => {
  log.debug('Backup preparation started')

  await managePermissions()

  const backupConfig = await initializeBackup(client)

  if (backupConfig.currentBackup.status === 'running') {
    return await getBackupInfo(client)
  }

  await setBackupAsInitializing(client)

  const mediasToBackup = await getMediasToBackup(client)

  await setBackupAsReady(client, mediasToBackup)

  return await getBackupInfo(client)
}

export const startBackup = async (client: CozyClient): Promise<BackupInfo> => {
  log.debug('Backup started')

  const {
    remoteBackupConfig: {
      backupFolder: { id: backupFolderId }
    },
    currentBackup: { mediasToBackup }
  } = await getLocalBackupConfig(client)

  await setBackupAsRunning(client)

  void uploadMedias(client, backupFolderId, mediasToBackup).then(() =>
    setBackupAsDone(client)
  )

  return await getBackupInfo(client)
}

export const getBackupInfo = async (
  client: CozyClient
): Promise<BackupInfo> => {
  const backupConfig = await getLocalBackupConfig(client)

  return {
    lastBackupDate: backupConfig.lastBackupDate,
    backupedMediasCount: backupConfig.backupedMedias.length,
    currentBackup: {
      status: backupConfig.currentBackup.status,
      mediasToBackupCount: backupConfig.currentBackup.mediasToBackup.length
    }
  }
}

const initializeBackup = async (
  client: CozyClient
): Promise<LocalBackupConfig> => {
  try {
    const backupConfig = await getLocalBackupConfig(client)

    return backupConfig
  } catch {
    // if there is no local backup config
    let deviceRemoteBackupConfig = await fetchDeviceRemoteBackupConfig(client)
    let backupedMedias

    if (deviceRemoteBackupConfig) {
      backupedMedias = await fetchBackupedMedias(
        client,
        deviceRemoteBackupConfig
      )
    } else {
      deviceRemoteBackupConfig = await createRemoteBackupFolder(client)
      backupedMedias = [] as BackupedMedia[]
    }

    const backupConfig = await initiazeLocalBackupConfig(
      client,
      deviceRemoteBackupConfig,
      backupedMedias
    )

    return backupConfig
  }
}
