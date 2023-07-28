import { Album } from '/app/domain/backup/models'

/**
 * A media on the device
 * @member {string} name
 * @member {number} path
 * @member {string} remotePath e.g. /Sauvegardé depuis mon mobile/My Android/Download
 * @member {string} type
 * @member {number} creationDate
 */
export interface Media {
  name: string
  path: string
  remotePath: string
  type: 'image' | 'video'
  subType?: 'PhotoLive'
  mimeType?: string
  creationDate: number
  modificationDate: number
  albums: Album[]
}

/**
 * A selection of media metadata stored locally to identify if a media has already been backuped
 * @member {string} name
 * @member {string} remotePath e.g. /Sauvegardé depuis mon mobile/My Android/Download
 * @member {string} remoteName e.g. IMG_001 (1).jpg (added only if different from name)
 */
export interface BackupedMedia {
  name: string
  remotePath: string
  remoteName?: string
}
