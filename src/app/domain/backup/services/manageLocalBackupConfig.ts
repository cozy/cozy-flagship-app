import CozyClient, {
  FileCollectionGetResult,
  IOCozyFile,
  StackErrors
} from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  Media,
  LocalBackupConfig,
  BackupedMedia,
  BackupedAlbum,
  LastBackup
} from '/app/domain/backup/models'
import { buildFileQuery } from '/app/domain/backup/queries'
import {
  fetchBackupedMedias,
  fetchDeviceRemoteBackupConfig,
  createRemoteBackupFolder,
  isInTrash
} from '/app/domain/backup/services/manageRemoteBackupConfig'
import { fetchBackupedAlbums } from '/app/domain/backup/services/manageAlbums'
import { isSameMedia } from '/app/domain/backup/helpers'
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
  const startTime = performance.now()

  const backupConfig = await getUserPersistedData<LocalBackupConfig>(
    client,
    UserPersistedStorageKeys.LocalBackupConfig
  )

  const endTime = performance.now()

  console.log(
    `🟢 getLocalBackupConfig took ${endTime - startTime} milliseconds.`
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

export const initializeLocalBackupConfig = async (
  client: CozyClient
): Promise<LocalBackupConfig> => {
  let deviceRemoteBackupConfig = await fetchDeviceRemoteBackupConfig(client)
  let backupedMedias
  let backupedAlbums

  if (deviceRemoteBackupConfig) {
    log.debug('Backup will be restored')

    backupedMedias = await fetchBackupedMedias(client)
    backupedAlbums = await fetchBackupedAlbums(client)
  } else {
    log.debug('Backup will be created')

    deviceRemoteBackupConfig = await createRemoteBackupFolder(client)
    backupedMedias = [] as BackupedMedia[]
    backupedAlbums = [] as BackupedAlbum[]
  }

  const newLocalBackupConfig = {
    ...INITIAL_BACKUP_CONFIG,
    remoteBackupConfig: deviceRemoteBackupConfig,
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
  const backupedMedia = localBackupConfig.backupedMedias.find(backupedMedia =>
    isSameMedia(backupedMedia, media)
  )

  if (!backupedMedia) {
    const newBackupedMedia: BackupedMedia = {
      name: media.name,
      uri: media.uri,
      creationDate: media.creationDate,
      modificationDate: media.modificationDate,
      remoteId: documentCreated.id!,
      md5: documentCreated.attributes.md5sum
    }

    localBackupConfig.backupedMedias.push(newBackupedMedia)
  }

  localBackupConfig.lastBackupDate = Date.now()

  // remove media from current backup
  localBackupConfig.currentBackup.mediasToBackup =
    localBackupConfig.currentBackup.mediasToBackup.filter(
      mediaToBackup => !isSameMedia(mediaToBackup, media)
    )

  await setLocalBackupConfig(client, localBackupConfig)
}

export const fixLocalBackupConfigIfNecessary = async (
  client: CozyClient
): Promise<LocalBackupConfig> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  const fileQuery = buildFileQuery(
    localBackupConfig.remoteBackupConfig.backupFolder.id
  )

  let remoteBackupFolderUpdated

  try {
    const { data } = (await client.query(fileQuery)) as FileCollectionGetResult

    remoteBackupFolderUpdated = data
  } catch (e) {
    if (e instanceof Error) {
      const { errors } = JSON.parse(e.message) as StackErrors

      if (errors.find(e => e.status === '404')) {
        throw new Error('Remote backup folder has been deleted.')
      }
    }

    throw e
  }

  if (isInTrash(remoteBackupFolderUpdated.attributes.path)) {
    throw new Error('Remote backup folder has been trashed.')
  }

  localBackupConfig.remoteBackupConfig.backupFolder.name =
    remoteBackupFolderUpdated.name
  localBackupConfig.remoteBackupConfig.backupFolder.path =
    remoteBackupFolderUpdated.path

  await setLocalBackupConfig(client, localBackupConfig)

  return localBackupConfig
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

export const setLastBackup = async (
  client: CozyClient,
  lastBackup: LastBackup
): Promise<void> => {
  const localBackupConfig = await getLocalBackupConfig(client)

  localBackupConfig.lastBackup = {
    ...lastBackup,
    message: lastBackup.message?.toLowerCase()
  }

  await setLocalBackupConfig(client, localBackupConfig)

  log.debug('Last backup set')
}

export const addRemoteDuplicatesToBackupedMedias = async (
  client: CozyClient
): Promise<void> => {
  log.debug('Trying to find remote duplicates')

  const localBackupConfig = await getLocalBackupConfig(client)

  const remoteDuplicates = await fetchBackupedMedias(client)

  const remoteDuplicatesNotAlreadyConsideredAsBackuped =
    remoteDuplicates.filter(
      m => !localBackupConfig.backupedMedias.find(a => isSameMedia(a, m))
    )

  log.debug(
    `${remoteDuplicatesNotAlreadyConsideredAsBackuped.length} medias found remotely that are present locally but not in local backuped medias`
  )

  localBackupConfig.backupedMedias = localBackupConfig.backupedMedias.concat(
    remoteDuplicatesNotAlreadyConsideredAsBackuped
  )

  await setLocalBackupConfig(client, localBackupConfig)
}
