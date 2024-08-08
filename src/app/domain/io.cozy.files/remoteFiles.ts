import CozyClient, { FileCollectionGetResult, Q } from 'cozy-client'
import { FileDocument } from 'cozy-client/types/types'

export const DOCTYPE_FILES = 'io.cozy.files'

export const getFileById = async (
  client: CozyClient,
  id: string
): Promise<FileDocument> => {
  const query = Q(DOCTYPE_FILES).getById(id)
  const { data } = (await client.query(query)) as FileCollectionGetResult

  return data as unknown as FileDocument
}

export const getDownloadUrlById = async (
  client: CozyClient,
  id: string,
  filename: string
): Promise<string> => {
  const fileCollection = client.collection(
    DOCTYPE_FILES
  ) as unknown as FileCollection
  const downloadURL = await fileCollection.getDownloadLinkById(id, filename)

  return downloadURL
}

interface FileCollection {
  getDownloadLinkById: (id: string, filename: string) => Promise<string>
}
