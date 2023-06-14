import { Media, BackupedMedia } from '/app/domain/backup/models'

type BackupStatus = 'to_do' | 'initializing' | 'ready' | 'running' | 'done'

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
  currentBackup: {
    status: BackupStatus
    mediasToBackup: Media[]
  }
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
  lastBackupDate: number
  backupedMediasCount: number
  currentBackup: {
    status: BackupStatus
    mediasToBackupCount: number
  }
}
