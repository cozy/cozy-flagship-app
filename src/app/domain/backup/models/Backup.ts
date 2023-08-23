import { Media, BackupedMedia, BackupedAlbum } from '/app/domain/backup/models'

type BackupStatus = 'to_do' | 'initializing' | 'ready' | 'running' | 'done'

interface LastBackupSuccess {
  status: 'success'
  backedUpMediaCount: number
  totalMediasToBackupCount: number
}

interface LastBackupError {
  status: 'error'
  errorMessage: string
}

type LastBackup = LastBackupSuccess | LastBackupError

/**
 * A local backup config representing the current backup of the device
 * @member {RemoteBackupConfig} remoteBackupConfig
 * @member {number} lastBackupDate
 * @member {BackupedMedia[]} backupedMedias
 * @member {object} currentBackup
 */
export interface LocalBackupConfig {
  remoteBackupConfig: RemoteBackupConfig
  lastBackupDate: number
  backupedMedias: BackupedMedia[]
  backupedAlbums: BackupedAlbum[]
  currentBackup: {
    status: BackupStatus
    mediasToBackup: Media[]
    totalMediasToBackupCount: number
  }
  lastBackup?: LastBackup
}

/**
 * A remote backup config representing a backup in Cozy Drive
 * @member {object} backupFolder
 * @member {string[]} backupDevicesIds
 */
export interface RemoteBackupConfig {
  backupFolder: {
    id: string
    name: string
    path: string
  }
  backupDeviceIds: string[]
}

/**
 * An object representing everything a front end need to know about a backup
 * @member {number} lastBackupDate
 * @member {number} backupedMediasCount
 * @member {object} currentBackup
 */
export interface BackupInfo {
  remoteBackupConfig: RemoteBackupConfig
  lastBackupDate: number
  backupedMediasCount: number
  currentBackup: {
    status: BackupStatus
    mediasToBackupCount: number
    totalMediasToBackupCount: number
  }
  lastBackup?: LastBackup
}

export type ProgressCallback = (backupInfo: BackupInfo) => Promise<void>
