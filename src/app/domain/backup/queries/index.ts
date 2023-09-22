import { Q, QueryDefinition } from 'cozy-client'

const DOCTYPE_FILES = 'io.cozy.files'
const DOCTYPE_ALBUMS = 'io.cozy.photos.albums'

export const buildAllMediasFilesQuery = (): QueryDefinition => {
  return Q(DOCTYPE_FILES)
    .where({
      type: 'file',
      class: { $or: ['image', 'video'] }
    })
    .indexFields(['class', 'type'])
    .select([
      'class',
      'type',
      'name',
      'path',
      'created_at',
      'updated_at',
      'md5sum'
    ])
}

export const buildFilesQuery = (deviceId: string): QueryDefinition => {
  return Q(DOCTYPE_FILES)
    .where({
      type: 'file',
      'metadata.backupDeviceIds': {
        $elemMatch: { $eq: deviceId }
      }
    })
    .indexFields(['metadata.backupDeviceIds', 'type'])
    .select([
      'metadata.backupDeviceIds',
      'type',
      'name',
      'path',
      'created_at',
      'updated_at',
      'md5sum'
    ])
}

export const buildFileQuery = (id: string): QueryDefinition => {
  return Q(DOCTYPE_FILES).getById(id)
}

export interface File {
  id: string
  name: string
  path: string
  created_at: number
  updated_at: number
  md5sum: string
}

export type FilesQueryAllResult = File[]

export const buildAlbumsQuery = (deviceId: string): QueryDefinition => {
  return Q(DOCTYPE_ALBUMS)
    .where({
      backupDeviceIds: {
        $elemMatch: { $eq: deviceId }
      }
    })
    .indexFields(['backupDeviceIds'])
    .select(['backupDeviceIds', 'name'])
}

export interface AlbumDocument {
  id: string
  name: string
}

export type AlbumsQueryAllResult = AlbumDocument[]
