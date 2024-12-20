import DeviceInfo from 'react-native-device-info'

import CozyClient, {
  FileCollectionGetResult,
  StackErrors,
  SplitFilenameResult,
  models
} from 'cozy-client'
import Minilog from 'cozy-minilog'
import { IOCozyFile } from 'cozy-client/types/types'
import flag from 'cozy-flags'

import {
  Media,
  BackupedMedia,
  RemoteBackupConfig
} from '/app/domain/backup/models'
import {
  buildAllMediasFilesQuery,
  buildFilesQuery,
  buildFileQuery,
  File,
  FilesQueryAllResult
} from '/app/domain/backup/queries'
import { getAllMedias } from '/app/domain/backup/services/getMedias'
import { t } from '/locales/i18n'

const log = Minilog('💿 Backup')

const DOCTYPE_APPS = 'io.cozy.apps'
const DOCTYPE_FILES = 'io.cozy.files'
const BACKUP_REF = `io.cozy.apps/photos/mobile`
const PHOTOS_REF = `io.cozy.apps/photos`

interface Folder {
  _id: string
  attributes: {
    name: string
    path: string
  }
}

interface BackupFolder {
  _id: string
  attributes: {
    name: string
    path: string
    created_at: string
    metadata?: {
      backupDeviceIds: string[]
    }
  }
}

interface BackupFolderAttributes {
  type: string
  _type: string
  name: string
  dirId: string
  metadata: { backupDeviceIds: string[] }
}

export const isInTrash = (path: string): boolean => {
  return path.startsWith('/.cozy_trash')
}

export const fetchRemoteBackupConfigs = async (
  client: CozyClient
): Promise<RemoteBackupConfig[]> => {
  const { included } = await client.collection(DOCTYPE_FILES).findReferencedBy({
    _type: DOCTYPE_APPS,
    _id: BACKUP_REF
  })

  const backupFolders = included as BackupFolder[]

  const remoteBackupConfigs: RemoteBackupConfig[] = backupFolders
    .filter(folder => !isInTrash(folder.attributes.path))
    .sort(
      (a, b) =>
        new Date(b.attributes.created_at).getTime() -
        new Date(a.attributes.created_at).getTime()
    )
    .map(backupFolder => ({
      backupFolder: {
        id: backupFolder._id,
        name: backupFolder.attributes.name,
        path: backupFolder.attributes.path
      },
      backupDeviceIds: backupFolder.attributes.metadata?.backupDeviceIds ?? []
    }))

  return remoteBackupConfigs
}

export const isRemoteBackupConfigFromDevice = (
  remoteBackupConfig: RemoteBackupConfig,
  deviceId: string
): boolean => {
  return remoteBackupConfig.backupDeviceIds.includes(deviceId)
}

export const fetchDeviceRemoteBackupConfig = async (
  client: CozyClient
): Promise<RemoteBackupConfig | undefined> => {
  const remoteBackupConfigs = await fetchRemoteBackupConfigs(client)
  const deviceId = await getDeviceId()

  const remoteBackupConfig = remoteBackupConfigs.find(remoteBackupConfig =>
    isRemoteBackupConfigFromDevice(remoteBackupConfig, deviceId)
  )

  return remoteBackupConfig
}

const createRemoteBackupFolderWithConflictStrategy = async (
  client: CozyClient,
  backupFolderAttributes: BackupFolderAttributes
): Promise<FileCollectionGetResult> => {
  try {
    return (await client.save(
      backupFolderAttributes
    )) as FileCollectionGetResult
  } catch (e) {
    if (e instanceof Error) {
      try {
        const { errors } = JSON.parse(e.message) as StackErrors

        if (errors.find(e => e.status === '409')) {
          const { filename } = models.file.splitFilename({
            type: 'file',
            name: backupFolderAttributes.name
          } as IOCozyFile) as SplitFilenameResult

          return await createRemoteBackupFolderWithConflictStrategy(client, {
            ...backupFolderAttributes,
            name: models.file.generateNewFileNameOnConflict(filename)
          })
        }
      } catch {
        throw e
      }
    }

    throw e
  }
}

export const getOrCreatePhotosMagicFolder = async (
  client: CozyClient
): Promise<Folder> => {
  const { included } = await client.collection(DOCTYPE_FILES).findReferencedBy({
    _type: DOCTYPE_APPS,
    _id: PHOTOS_REF
  })

  let photosMagicFolders = included as Folder[]

  photosMagicFolders = photosMagicFolders.filter(
    folder => !isInTrash(folder.attributes.path)
  )

  if (photosMagicFolders.length > 0) {
    return photosMagicFolders[0]
  }

  const { data: newPhotosMagicFolder } = await client
    .collection(DOCTYPE_FILES)
    .createDirectoryByPath('/Photos')

  await client.collection(DOCTYPE_FILES).addReferencesTo(
    {
      _id: PHOTOS_REF,
      _type: DOCTYPE_APPS
    },
    [
      {
        _id: newPhotosMagicFolder._id
      }
    ]
  )

  return {
    _id: newPhotosMagicFolder._id,
    attributes: {
      name: newPhotosMagicFolder.name,
      path: newPhotosMagicFolder.path
    }
  }
}

export const createRemoteBackupFolder = async (
  client: CozyClient
): Promise<RemoteBackupConfig> => {
  const deviceName = await getDeviceName()
  const deviceId = await getDeviceId()

  const photosMagicFolder = await getOrCreatePhotosMagicFolder(client)

  const {
    data: { _id: backupRootId }
  } = await client
    .collection(DOCTYPE_FILES)
    .getDirectoryOrCreate(
      t('services.backup.backupRootName'),
      photosMagicFolder
    )

  const backupFolderAttributes = {
    type: 'directory',
    _type: 'io.cozy.files',
    name: deviceName,
    dirId: backupRootId,
    metadata: { backupDeviceIds: [deviceId] }
  }

  const {
    data: { _id: backupFolderId }
  } = await createRemoteBackupFolderWithConflictStrategy(
    client,
    backupFolderAttributes
  )

  await client.collection(DOCTYPE_FILES).addReferencesTo(
    {
      _id: BACKUP_REF,
      _type: DOCTYPE_APPS
    },
    [
      {
        _id: backupFolderId
      }
    ]
  )

  const fileQuery = buildFileQuery(backupFolderId)
  const fileQueryOptions = { forceStack: true }

  const { data: backupFolder } = (await client.query(
    fileQuery,
    fileQueryOptions
  )) as FileCollectionGetResult

  const remoteBackupConfig = {
    backupFolder: {
      id: backupFolder._id,
      name: backupFolder.name,
      path: backupFolder.path
    },
    backupDeviceIds: backupFolder.metadata?.backupDeviceIds ?? []
  }

  return remoteBackupConfig
}

export const isFileCorrespondingToMedia = (
  file: File,
  media: Media
): boolean => {
  if (file.name !== media.name) {
    return false
  }

  const creationDateFromLibrary = file.metadata?.creationDateFromLibrary

  /* File come from the new backup */

  if (creationDateFromLibrary) {
    const creationDate = new Date(creationDateFromLibrary)
    creationDate.setMilliseconds(0)

    return creationDate.getTime() === media.creationDate
  }

  if (flag('flagship.backup.dedup')) {
    const creationDate = new Date(file.created_at)
    const mediaCreationDate = new Date(media.creationDate)

    return (
      creationDate.getUTCFullYear() === mediaCreationDate.getUTCFullYear() &&
      creationDate.getUTCMonth() === mediaCreationDate.getUTCMonth() &&
      creationDate.getUTCDate() === mediaCreationDate.getUTCDate() &&
      creationDate.getUTCMinutes() === mediaCreationDate.getUTCMinutes() &&
      creationDate.getUTCSeconds() === mediaCreationDate.getUTCSeconds()
    )
  } else {
    const creationDate = new Date(file.created_at)
    creationDate.setMilliseconds(0)

    return creationDate.getTime() === media.creationDate
  }
}

const findFileCorrespondingMedia = (
  allMedias: Media[],
  file: File
): BackupedMedia | undefined => {
  const correspondingMedia = allMedias.find(media =>
    isFileCorrespondingToMedia(file, media)
  )

  if (!correspondingMedia) return undefined

  return {
    name: correspondingMedia.name,
    uri: correspondingMedia.uri,
    creationDate: correspondingMedia.creationDate,
    modificationDate: correspondingMedia.modificationDate,
    remoteId: file.id,
    md5: file.md5sum
  }
}

const removeUndefined = (
  backupedMedia: BackupedMedia | undefined
): backupedMedia is NonNullable<BackupedMedia> => !!backupedMedia

export const filterMediasAlreadyBackuped = (
  allMedias: Media[],
  files: File[]
): BackupedMedia[] => {
  return files
    .filter(file => !isInTrash(file.path))
    .map(file => findFileCorrespondingMedia(allMedias, file))
    .filter(removeUndefined)
}

let cachedRemoteFiles = [] as File[]

export const setRemoteFiles = (remoteFiles: File[]): void => {
  cachedRemoteFiles = remoteFiles
}

export const getRemoteFiles = (): File[] => {
  return cachedRemoteFiles
}

const fetchAllRemoteFiles = async (client: CozyClient): Promise<File[]> => {
  const filesQuery = buildAllMediasFilesQuery()
  const fileQueryOptions = { forceStack: true }

  const remoteFiles = (await client.queryAll(
    filesQuery,
    fileQueryOptions
  )) as FilesQueryAllResult

  const remoteFilesNotInTrash = remoteFiles.filter(
    file => !isInTrash(file.path)
  )

  return remoteFilesNotInTrash
}

export const prepareDeduplication = async (
  client: CozyClient
): Promise<void> => {
  log.debug('Preparing deduplication')

  const remoteFiles = await fetchAllRemoteFiles(client)

  setRemoteFiles(remoteFiles)

  log.debug(`${remoteFiles.length} found remotely`)
}

export const getCorrespondingRemoteFile = (media: Media): File | undefined => {
  const remoteFiles = getRemoteFiles()

  const correspondingRemoteFile = remoteFiles.find(remoteFile =>
    isFileCorrespondingToMedia(remoteFile, media)
  )

  return correspondingRemoteFile
}

export const fetchBackupedMedias = async (
  client: CozyClient
): Promise<BackupedMedia[]> => {
  const deviceId = await getDeviceId()

  const allMedias = await getAllMedias(client)

  const filesQuery = buildFilesQuery(deviceId)

  const filesQueryOption = { forceStack: true }
  const data = (await client.queryAll(
    filesQuery,
    filesQueryOption
  )) as FilesQueryAllResult

  const backupedMedias = filterMediasAlreadyBackuped(allMedias, data)

  return backupedMedias
}

export const getDeviceName = async (): Promise<string> => {
  return await DeviceInfo.getDeviceName()
}

export const getDeviceId = async (): Promise<string> => {
  return await DeviceInfo.getUniqueId()
}
