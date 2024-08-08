import CozyClient, { FileCollectionGetResult, Q } from 'cozy-client'
import { FileDocument } from 'cozy-client/types/types'

export const DOCTYPE_FILES = 'io.cozy.files'

const IMPORTANT_PAPERS = [
  'bank_details',
  'driver_license',
  'identity_photo',
  'national_health_insurance_card',
  'national_id_card',
  'passport',
  'residence_permit',
  'resume',
  'vehicle_registration'
]

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

export const getImportantFiles = async (
  client: CozyClient
): Promise<FileDocument[]> => {
  const query = Q(DOCTYPE_FILES)
    .where({
      created_at: {
        $gt: null
      },
      'metadata.qualification.label': {
        $in: IMPORTANT_PAPERS
      }
    })
    .partialIndex({
      type: 'file',
      trashed: false,
      'cozyMetadata.createdByApp': { $exists: true }
    })
    .indexFields(['created_at', 'metadata.qualification.label'])
    .sortBy([{ created_at: 'desc' }])

  const { data } = (await client.query(query)) as FileCollectionGetResult

  return data as unknown as FileDocument[]
}

interface FileCollection {
  getDownloadLinkById: (id: string, filename: string) => Promise<string>
}
