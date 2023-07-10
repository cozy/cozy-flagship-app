import Minilog from '@cozy/minilog'

import {
  getLocalBackupConfig,
  initiazeLocalBackupConfig,
  setBackupAsInitializing,
  setBackupAsReady,
  setBackupAsRunning,
  setBackupAsDone,
  saveAlbums
} from '/app/domain/backup/services/manageLocalBackupConfig'
import {
  getAlbums,
  createRemoteAlbums
} from '/app/domain/backup/services/manageAlbums'
import { getMediasToBackup } from '/app/domain/backup/services/getMedias'
import { uploadMedias } from '/app/domain/backup/services/uploadMedias'
import {
  fetchDeviceRemoteBackupConfig,
  fetchBackupedMedias,
  createRemoteBackupFolder
} from '/app/domain/backup/services/manageRemoteBackupConfig'
import {
  activateKeepAwake,
  deactivateKeepAwake
} from '/app/domain/sleep/services/sleep'

import type CozyClient from 'cozy-client'

import {
  BackupInfo,
  ProgressCallback,
  BackupedMedia,
  LocalBackupConfig
} from '/app/domain/backup/models'

const log = Minilog('💿 Backup')

export {
  checkBackupPermissions,
  requestBackupPermissions
} from '/app/domain/backup/services/managePermissions'

export const prepareBackup = async (
  client: CozyClient,
  onProgress: ProgressCallback
): Promise<BackupInfo> => {
  log.debug('Backup preparation started')

  const backupConfig = await initializeBackup(client)

  if (backupConfig.currentBackup.status === 'running') {
    return await getBackupInfo(client)
  }

  await setBackupAsInitializing(client)

  onProgress(await getBackupInfo(client))

  const albums = await getAlbums()

  const createdAlbums = await createRemoteAlbums(client, albums)

  await saveAlbums(client, createdAlbums)

  const mediasToBackup = await getMediasToBackup(client)

  await setBackupAsReady(client, mediasToBackup)

  onProgress(await getBackupInfo(client))

  log.debug('Backup preparation done')

  return await getBackupInfo(client)
}

export const startBackup = async (
  client: CozyClient,
  onProgress: ProgressCallback
): Promise<BackupInfo> => {
  log.debug('Backup started')

  const {
    remoteBackupConfig: {
      backupFolder: { id: backupFolderId }
    },
    currentBackup: { mediasToBackup }
  } = await getLocalBackupConfig(client)

  await setBackupAsRunning(client)

  onProgress(await getBackupInfo(client))

  activateKeepAwake()

  await uploadMedias(client, backupFolderId, mediasToBackup, onProgress)

  deactivateKeepAwake()

  await setBackupAsDone(client)

  log.debug('Backup done')

  onProgress(await getBackupInfo(client))

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
      mediasToBackupCount: backupConfig.currentBackup.mediasToBackup.length,
      totalMediasToBackupCount:
        backupConfig.currentBackup.totalMediasToBackupCount
    }
  }
}

const initializeBackup = async (
  client: CozyClient
): Promise<LocalBackupConfig> => {
  try {
    const backupConfig = await getLocalBackupConfig(client)

    log.debug('Backup found')

    return backupConfig
  } catch {
    // if there is no local backup config
    let deviceRemoteBackupConfig = await fetchDeviceRemoteBackupConfig(client)
    let backupedMedias

    if (deviceRemoteBackupConfig) {
      log.debug('Backup will be restored')

      backupedMedias = await fetchBackupedMedias(
        client,
        deviceRemoteBackupConfig
      )
    } else {
      log.debug('Backup will be created')
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
