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