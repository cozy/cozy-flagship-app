import { Q, QueryDefinition } from 'cozy-client'

const DOCTYPE_FILES = 'io.cozy.files'

export const buildFilesQuery = (dirId: string): QueryDefinition => {
  return Q(DOCTYPE_FILES)
    .where({
      dir_id: dirId,
      type: 'file'
    })
    .indexFields(['dir_id', 'type'])
    .select(['name', 'dir_id', 'type'])
}

export const buildFileQuery = (id: string): QueryDefinition => {
  return Q(DOCTYPE_FILES).getById(id)
}

interface File {
  id: string
  name: string
}

export type FilesQueryAllResult = File[]
