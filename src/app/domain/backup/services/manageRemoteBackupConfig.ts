import DeviceInfo from 'react-native-device-info'

import CozyClient, {
  FileCollectionGetResult,
  StackErrors,
  SplitFilenameResult,
  models
} from 'cozy-client'
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

const isInTrash = (path: string): boolean => {
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

  const { data: backupFolder } = (await client.query(
    fileQuery
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

const isFileCorrespondingToMedia = (file: File, media: Media): boolean => {
  return (
    file.name === media.name &&
    new Date(file.created_at).getTime() === media.creationDate &&
    new Date(file.updated_at).getTime() === media.modificationDate
  )
}

const formatBackupedMedia = (
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

export const fetchBackupedMedias = async (
  client: CozyClient
): Promise<BackupedMedia[]> => {
  const deviceId = await getDeviceId()

  const allMedias = await getAllMedias(client)

  let data

  if (flag('flagship.backup.dedup')) {
    const filesQuery = buildAllMediasFilesQuery()

    data = (await client.queryAll(filesQuery)) as FilesQueryAllResult
  } else {
    const filesQuery = buildFilesQuery(deviceId)

    data = (await client.queryAll(filesQuery)) as FilesQueryAllResult
  }

  const backupedMedias = data
    .filter(file => !isInTrash(file.path))
    .map(file => formatBackupedMedia(allMedias, file))
    .filter(removeUndefined)

  return backupedMedias
}

export const getDeviceName = async (): Promise<string> => {
  return await DeviceInfo.getDeviceName()
}

export const getDeviceId = async (): Promise<string> => {
  return await DeviceInfo.getUniqueId()
}
