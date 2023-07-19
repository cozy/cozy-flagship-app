import { StackErrors, IOCozyFile } from 'cozy-client'

import { Album } from '/app/domain/backup/models'

/**
 * A media on the device
 * @member {string} name
 * @member {number} path
 * @member {string} type
 * @member {number} creationDate
 */
export interface Media {
  name: string
  path: string
  type: 'image' | 'video'
  subType?: 'PhotoLive'
  creationDate: number
  albums: Album[]
}

/**
 * A selection of media metadata stored locally to identify if a media has already been backuped
 * @member {string} name
 */
export interface BackupedMedia {
  name: string
}

export type UploadMediaError = {
  statusCode: number
} & StackErrors

// These type is incomplete there is more information in data
export interface UploadMediaResult {
  statusCode: number
  data: IOCozyFile
}
