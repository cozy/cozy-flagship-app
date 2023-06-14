import DeviceInfo from 'react-native-device-info'

import { BackupedMedia, RemoteBackupConfig } from '/app/domain/backup/models'

import type CozyClient from 'cozy-client'

import {
  buildFilesQuery,
  FilesQueryAllResult
} from '/app/domain/backup/queries'

const DOCTYPE_APPS = 'io.cozy.apps'
const DOCTYPE_FILES = 'io.cozy.files'
const BACKUP_REF = `io.cozy.apps/photos/mobile`
const BACKUP_ROOT_PATH = '/Sauvegardé depuis mon mobile'

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

export const createRemoteBackupFolder = async (
  client: CozyClient
): Promise<RemoteBackupConfig> => {
  const deviceName = await getDeviceName()
  const deviceId = await getDeviceId()

  const {
    data: { _id: backupRootId }
  } = await client
    .collection(DOCTYPE_FILES)
    .createDirectoryByPath(BACKUP_ROOT_PATH)

  const backupFolderAttributes = {
    type: 'directory',
    _type: 'io.cozy.files',
    name: deviceName,
    dirId: backupRootId,
    metadata: { backupDeviceIds: [deviceId] }
  }

  const {
    data: { _id: backupFolderId }
  } = (await client.save(backupFolderAttributes)) as FileCollectionGetResult

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

  const { data: backupFolder } = await client
    .collection(DOCTYPE_FILES)
    .get(backupFolderId)

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

export const fetchBackupedMedias = async (
  client: CozyClient,
  deviceRemoteBackupConfig: RemoteBackupConfig
): Promise<BackupedMedia[]> => {
  const { backupFolder } = deviceRemoteBackupConfig

  const filesQuery = buildFilesQuery(backupFolder.id)

  const data = (await client.queryAll(filesQuery)) as FilesQueryAllResult

  const backupedMedias = data.map(file => ({
    name: file.name
  }))

  return backupedMedias
}

export const getDeviceName = async (): Promise<string> => {
  return await DeviceInfo.getDeviceName()
}

export const getDeviceId = async (): Promise<string> => {
  return await DeviceInfo.getUniqueId()
}
