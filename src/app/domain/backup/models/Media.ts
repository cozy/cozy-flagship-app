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
  creationDate: number
}

/**
 * A selection of media metadata stored locally to identify if a media has already been backuped
 * @member {string} name
 */
export interface BackupedMedia {
  name: string
}