import { Album } from '/app/domain/backup/models'

/**
 * A media on the device
 * @member {string} name
 * @member {number} path
 * @member {string} remotePath e.g. /Sauvegardé depuis mon mobile/My Android/Download
 * @member {string} type
 * @member {number} creationDate timestamp with ms set to 0
 * @member {number} modificationDate  timestamp with ms set to 0
 */
export interface Media {
  name: string
  uri: string
  path: string
  remotePath: string
  type: 'image' | 'video'
  subType?: 'PhotoLive'
  mimeType?: string
  creationDate: number
  modificationDate: number
  albums: Album[]
  fileSize: number | null
}

/**
 * A selection of media metadata stored locally to identify if a media has already been backuped
 * When it is not prefixed by remote, it means that it is the local value, or at least the local value when we backed up the media
 * @member {string} name e.g. "IMG_50.jpg"
 * @member {string} uri e.g. "file:///storage/emulated/0/Download/IMG_50.jpg" on Android or "ph://0E75CF5E-4587-4BD7-AB07-E940BB627C4B/L0/001" on iOS
 * @member {number} creationDate timestamp with ms set to 0, e.g. 1694523521000
 * @member {number} modificationDate timestamp with ms set to 0, e.g. 1694172391000
 * @member {string} remoteId e.g. "d78a3c84139d173dde3b87df0003b32e"
 * @member {string} md5 e.g. "anQfyi/m1NIso1mHyYIzPA=="
 */
export interface BackupedMedia {
  name: string
  uri: string
  creationDate: number
  modificationDate: number
  remoteId: string
  md5: string
}
