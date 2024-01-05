import { Media, BackupedMedia, BackupedAlbum } from '/app/domain/backup/models'

type BackupStatus = 'to_do' | 'initializing' | 'ready' | 'running' | 'done'

/**
 * A local backup config representing the current backup of the device
 * @member {string} status
 * @member {number} code
 * @member {string} message Translated message to display to the user
 * @member {number} backedUpMediaCount
 * @member {number} totalMediasToBackupCount
 */
export interface LastBackup {
  status: 'success' | 'partial_success' | 'error'
  code?: number
  message?: string
  backedUpMediaCount: number
  totalMediasToBackupCount: number
  deduplicatedMediaCount: number
}

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
    deduplicatedMediaCount: number
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
 * @member {RemoteBackupConfig} remoteBackupConfig
 * @member {number} lastBackupDate
 * @member {number} backupedMediasCount
 * @member {object} currentBackup
 * @member {BackupStatus} currentBackup.status
 * @member {number} currentBackup.mediasToBackupCount Number of medias to backup, change during a backup
 * @member {number} currentBackup.totalMediasToBackupCount Total number of medias to backup, do not change during a backup
 * @member {number} [currentBackup.mediasLoadedCount] Number of medias loaded from the native side
 * @member {LastBackup} [lastBackup]
 */
export interface BackupInfo {
  remoteBackupConfig: RemoteBackupConfig
  lastBackupDate: number
  backupedMediasCount: number
  currentBackup: {
    status: BackupStatus
    mediasToBackupCount: number
    totalMediasToBackupCount: number
    mediasLoadedCount?: number
  }
  lastBackup?: LastBackup
}

export type ProgressCallback = (backupInfo: BackupInfo) => Promise<void>
