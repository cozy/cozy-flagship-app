import { StackErrors, IOCozyFile } from 'cozy-client'

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
  creationDate: number
  albums: Album[]
}

/**
 * A selection of media metadata stored locally to identify if a media has already been backuped
 * @member {string} name
 * @member {string} remotePath e.g. /Sauvegardé depuis mon mobile/My Android/Download
 */
export interface BackupedMedia {
  name: string
  remotePath: string
}

export type UploadMediaError = {
  statusCode: number
} & StackErrors

// These type is incomplete there is more information in data
export interface UploadMediaResult {
  statusCode: number
  data: IOCozyFile
}
