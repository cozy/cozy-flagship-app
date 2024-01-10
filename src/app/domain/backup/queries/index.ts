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
      'metadata.idFromLibrary',
      'metadata.creationDateFromLibrary',
      'type',
      'name',
      'path',
      'created_at',
      'updated_at',
      'md5sum',
      'referenced_by'
    ])
    .limitBy(1000)
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
      'metadata.idFromLibrary',
      'metadata.creationDateFromLibrary',
      'type',
      'name',
      'path',
      'created_at',
      'updated_at',
      'md5sum',
      'referenced_by'
    ])
    .limitBy(1000)
}

export const buildFileQuery = (id: string): QueryDefinition => {
  return Q(DOCTYPE_FILES).getById(id)
}

export interface File {
  id: string
  name: string
  path: string
  created_at: string
  updated_at: string
  md5sum: string
  metadata?: {
    idFromLibrary?: string
    creationDateFromLibrary?: string
  }
  relationships: {
    referenced_by: {
      data: {
        id: string
        type: string
      }[]
    }
  }
}

export type FilesQueryAllResult = File[]

export const buildAlbumsQuery = (): QueryDefinition => {
  return Q(DOCTYPE_ALBUMS)
    .where({
      backupDeviceIds: {
        $exists: true
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
