import { BackupedMedia } from '/app/domain/backup/models'

/**
 * A local backup config representing the current backup of the device
 * @member {string} remotePath
 * @member {number} lastBackupDate
 * @member {BackupedMedia[]} backupedMedias
 */
export interface LocalBackupConfig {
  remotePath: string
  lastBackupDate: number
  backupedMedias: BackupedMedia[]
}

/**
 * A remote backup config representing a backup in Cozy Drive
 * @member {object} backupFolder
 */
export interface RemoteBackupConfig {
  backupFolder: {
    name: string
    path: string
  }
}

/**
 * An object representing everything a front end need to know about a backup
 * @member {number} lastBackupDate
 * @member {number} backupedMediasCount
 */
export interface BackupInfo {
  lastBackupDate: number
  backupedMediasCount: number
}
