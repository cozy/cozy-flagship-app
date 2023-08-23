import CozyClient, { FileCollectionGetResult, IOCozyFile } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  Media,
  LocalBackupConfig,
  RemoteBackupConfig,
  BackupedMedia,
  BackupedAlbum
} from '/app/domain/backup/models'
import { buildFileQuery } from '/app/domain/backup/queries'
import {
  getUserPersistedData,
  storeUserPersistedData,
  UserPersistedStorageKeys
} from '/libs/localStore'
import { t } from '/locales/i18n'

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
  backupedAlbums: [],
  currentBackup: {
    status: 'to_do',
    mediasToBackup: [],
    totalMediasToBackupCount: 0
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
    throw new Error(t('services.backup.errors.configNotInitialized'))
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
  backupedMedias: BackupedMedia[],
  backupedAlbums: BackupedAlbum[]
): Promise<LocalBackupConfig> => {
  const newLocalBackupConfig = {
    ...INITIAL_BACKUP_CONFIG,
    remoteBackupConfig: remoteBackupConfig,
    backupedMedias: backupedMedias,
    backupedAlbums: backupedAlbums
  }

  await setLocalBackupConfig(client, newLocalBackupConfig)

  return newLocalBackupConfig
}

export const saveAlbums = async (
  client: CozyClient,
  albums: BackupedAlbum[]
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  // add media to backuped medias
  const concatenation = [...albums, ...localBackupConfig.backupedAlbums]
  const newBackupedAlbums = Object.values(
    concatenation.reduce((acc, obj) => ({ ...acc, [obj.remoteId]: obj }), {})
  ) as unknown as BackupedAlbum[]

  localBackupConfig.backupedAlbums = newBackupedAlbums

  await setLocalBackupConfig(client, localBackupConfig)
}

export const setMediaAsBackuped = async (
  client: CozyClient,
  media: Media,
  documentCreated: IOCozyFile
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  // add media to backuped medias
  const backupedMedia = localBackupConfig.backupedMedias.find(
    backupedMedia =>
      backupedMedia.name === media.name &&
      backupedMedia.remotePath === media.remotePath
  )

  if (!backupedMedia) {
    const newBackupedMedia = {
      name: media.name,
      remotePath: media.remotePath
    } as BackupedMedia

    if (documentCreated.attributes.name !== media.name) {
      newBackupedMedia.remoteName = documentCreated.attributes.name
    }

    localBackupConfig.backupedMedias.push(newBackupedMedia)
  }

  localBackupConfig.lastBackupDate = Date.now()

  // remove media from current backup
  localBackupConfig.currentBackup.mediasToBackup =
    localBackupConfig.currentBackup.mediasToBackup.filter(
      mediaToBackup => mediaToBackup.name !== media.name
    )

  await setLocalBackupConfig(client, localBackupConfig)
}

export const updateRemoteBackupConfigLocally = async (
  client: CozyClient
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  const fileQuery = buildFileQuery(
    localBackupConfig.remoteBackupConfig.backupFolder.id
  )

  const { data: remoteBackupFolderUpdated } = (await client.query(
    fileQuery
  )) as FileCollectionGetResult

  localBackupConfig.remoteBackupConfig.backupFolder.name =
    remoteBackupFolderUpdated.name
  localBackupConfig.remoteBackupConfig.backupFolder.path =
    remoteBackupFolderUpdated.path

  await setLocalBackupConfig(client, localBackupConfig)
}

export const setBackupAsToDo = async (client: CozyClient): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.currentBackup.status = 'to_do'

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup set as to do')
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
  mediasToBackup?: Media[]
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  if (mediasToBackup) {
    localBackupConfig.currentBackup.mediasToBackup = mediasToBackup
    localBackupConfig.currentBackup.totalMediasToBackupCount =
      mediasToBackup.length
  } else {
    localBackupConfig.currentBackup.totalMediasToBackupCount =
      localBackupConfig.currentBackup.mediasToBackup.length
  }

  localBackupConfig.currentBackup.status = 'ready'

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup set as ready')
  log.debug(
    `  ${localBackupConfig.currentBackup.totalMediasToBackupCount}  medias to backup`
  )
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

interface SetLastBackupAsSuccessParams {
  remainingMediaCount: number
  totalMediasToBackupCount: number
}

export const setLastBackupAsSuccess = async (
  client: CozyClient,
  params: SetLastBackupAsSuccessParams
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.lastBackup = {
    status: 'success',
    backedUpMediaCount:
      params.totalMediasToBackupCount - params.remainingMediaCount,
    totalMediasToBackupCount: params.totalMediasToBackupCount
  }

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup success')
}

interface SetLastBackupAsErrorParams {
  errorMessage: string
}

export const setLastBackupAsError = async (
  client: CozyClient,
  params: SetLastBackupAsErrorParams
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.lastBackup = {
    status: 'error',
    errorMessage: params.errorMessage
  }

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Backup error')
}
