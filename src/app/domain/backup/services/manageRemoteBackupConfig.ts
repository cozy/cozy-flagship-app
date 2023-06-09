import DeviceInfo from 'react-native-device-info'

import { RemoteBackupConfig } from '/app/domain/backup/models'

import type CozyClient from 'cozy-client'

const DOCTYPE_APPS = 'io.cozy.apps'
const DOCTYPE_FILES = 'io.cozy.files'
const BACKUP_REF = `io.cozy.apps/photos/mobile`
const BACKUP_ROOT_PATH = '/Sauvegardé depuis mon mobile'

interface BackupFolder {
  _id: string
  attributes: {
    name: string
    path: string
  }
}

export const fetchRemoteBackupConfigs = async (
  client: CozyClient
): Promise<RemoteBackupConfig[]> => {
  const { included } = await client.collection(DOCTYPE_FILES).findReferencedBy({
    _type: DOCTYPE_APPS,
    _id: BACKUP_REF
  })

  const backupFolders = included as BackupFolder[]

  const remoteBackupConfigs: RemoteBackupConfig[] = backupFolders.map(
    backupFolder => ({
      backupFolder: {
        id: backupFolder._id,
        name: backupFolder.attributes.name,
        path: backupFolder.attributes.path
      }
    })
  )

  return remoteBackupConfigs
}

// isRemoteBackupConfigFromDevice will later take into account a unique device id stored in folder metadata to be more robust
export const isRemoteBackupConfigFromDevice = (
  remoteBackupConfig: RemoteBackupConfig,
  deviceName: string
): boolean => {
  return remoteBackupConfig.backupFolder.name === deviceName
}

export const fetchDeviceRemoteBackupConfig = async (
  client: CozyClient
): Promise<RemoteBackupConfig | undefined> => {
  const remoteBackupConfigs = await fetchRemoteBackupConfigs(client)
  const deviceName = await getDeviceName()

  const remoteBackupConfig = remoteBackupConfigs.find(remoteBackupConfig =>
    isRemoteBackupConfigFromDevice(remoteBackupConfig, deviceName)
  )

  return remoteBackupConfig
}

export const createRemoteBackupFolder = async (
  client: CozyClient
): Promise<RemoteBackupConfig> => {
  const backupFolderPath = `${BACKUP_ROOT_PATH}/${await getDeviceName()}`

  const backupFolderId: string = await client
    .collection(DOCTYPE_FILES)
    .ensureDirectoryExists(backupFolderPath)

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
    }
  }

  return remoteBackupConfig
}

export const getDeviceName = async (): Promise<string> => {
  return await DeviceInfo.getDeviceName()
}
