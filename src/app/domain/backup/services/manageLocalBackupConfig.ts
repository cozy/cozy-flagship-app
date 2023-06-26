import Minilog from '@cozy/minilog'

import {
  Media,
  LocalBackupConfig,
  RemoteBackupConfig,
  BackupedMedia
} from '/app/domain/backup/models'
import {
  getUserPersistedData,
  storeUserPersistedData,
  UserPersistedStorageKeys
} from '/libs/localStore'

import type CozyClient from 'cozy-client'

const log = Minilog('💿 Backup')

const INITIAL_BACKUP_CONFIG: LocalBackupConfig = {
  remoteBackupConfig: {
    backupDeviceIds: [],
    backupFolder: {
      id: '',
      name: '',
      path: ''
    }
  },
  lastBackupDate: 0,
  backupedMedias: [],
  currentBackup: {
    status: 'to_do',
    mediasToBackup: []
  }
}

export const getLocalBackupConfig = async (
  client: CozyClient
): Promise<LocalBackupConfig> => {
  const backupConfig = await getUserPersistedData<LocalBackupConfig>(
    client,
    UserPersistedStorageKeys.LocalBackupConfig
  )

  if (backupConfig === null) {
    throw new Error('Local backup config has not been initialized')
  }

  return backupConfig
}

export const setLocalBackupConfig = async (
  client: CozyClient,
  backupConfig: LocalBackupConfig
): Promise<void> => {
  await storeUserPersistedData(
    client,
    UserPersistedStorageKeys.LocalBackupConfig,
    backupConfig
  )
}

export const initiazeLocalBackupConfig = async (
  client: CozyClient,
  remoteBackupConfig: RemoteBackupConfig,
  backupedMedias: BackupedMedia[]
): Promise<LocalBackupConfig> => {
  const newLocalBackupConfig = {
    ...INITIAL_BACKUP_CONFIG,
    remoteBackupConfig: remoteBackupConfig,
    backupedMedias: backupedMedias
  }

  await setLocalBackupConfig(client, newLocalBackupConfig)

  return newLocalBackupConfig
}

export const setMediaAsBackuped = async (
  client: CozyClient,
  media: Media
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  // add media to backuped medias
  const backupedMedia = localBackupConfig.backupedMedias.find(
    backupedMedia => backupedMedia.name === media.name
  )

  if (!backupedMedia) {
    localBackupConfig.backupedMedias.push({
      name: media.name
    })
  }

  localBackupConfig.lastBackupDate = Date.now()

  // remove media from current backup
  localBackupConfig.currentBackup.mediasToBackup =
    localBackupConfig.currentBackup.mediasToBackup.filter(
      mediaToBackup => mediaToBackup.name !== media.name
    )

  await setLocalBackupConfig(client, localBackupConfig)
}

export const setBackupAsInitializing = async (
  client: CozyClient
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.currentBackup.status = 'initializing'

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup set as initialized')
}

export const setBackupAsReady = async (
  client: CozyClient,
  mediasToBackup: Media[]
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.currentBackup.mediasToBackup = mediasToBackup
  localBackupConfig.currentBackup.status = 'ready'

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup set as ready')
  log.debug(`  ${mediasToBackup.length}  medias to backup`)
}

export const setBackupAsRunning = async (client: CozyClient): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.currentBackup.status = 'running'

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup set as running')
}

export const setBackupAsDone = async (client: CozyClient): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.currentBackup.status = 'done'

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup set as done')
}
