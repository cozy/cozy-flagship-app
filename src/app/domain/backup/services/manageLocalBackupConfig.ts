import { Media, LocalBackupConfig } from '/app/domain/backup/models'
import {
  getUserPersistedData,
  storeUserPersistedData,
  UserPersistedStorageKeys
} from '/libs/localStore'

import type CozyClient from 'cozy-client'

const INITIAL_BACKUP_CONFIG: LocalBackupConfig = {
  remotePath: '',
  lastBackupDate: 0,
  backupedMedias: []
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
  client: CozyClient
): Promise<void> => {
  await setLocalBackupConfig(client, INITIAL_BACKUP_CONFIG)
}

export const hasLocalBackupConfig = async (
  client: CozyClient
): Promise<boolean> => {
  try {
    await getLocalBackupConfig(client)

    return true
  } catch {
    return false
  }
}

export const setMediaAsBackuped = async (
  client: CozyClient,
  media: Media
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  const backupedMedia = localBackupConfig.backupedMedias.find(
    backupedMedia => backupedMedia.name === media.name
  )

  if (!backupedMedia) {
    localBackupConfig.backupedMedias.push({
      name: media.name
    })
  }

  await setLocalBackupConfig(client, localBackupConfig)
}
