import { format } from 'date-fns'

import CozyClient from 'cozy-client'
// @ts-expect-error Not typed
import { makeSharingLink } from 'cozy-client/dist/models/sharing'
import Minilog from 'cozy-minilog'

import { uploadFileWithConflictStrategy } from '/app/domain/upload/services'

const log = Minilog('🗒️ Support Uploader')

export interface File {
  name: string
  path: string
  mimetype: string
}

export const uploadFilesToSupportFolder = async (
  files: File[],
  client: CozyClient
): Promise<string> => {
  const token = client.getStackClient().token.accessToken

  if (!token) {
    throw new Error('No token found')
  }

  const logsFolderId = await createLogsFolder(client)

  for (const file of files) {
    const url = getUrl(client, logsFolderId, file.name)

    log.info('Send file', file.name)
    await uploadFileWithConflictStrategy({
      url,
      token,
      filename: file.name,
      filepath: file.path,
      mimetype: file.mimetype
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const link: string = await makeSharingLink(client, [logsFolderId])

  return link
}

const createLogsFolder = async (client: CozyClient): Promise<string> => {
  const date = format(new Date(), 'yyyyMMdd_HHmmss_SSS')
  const existingLogsFolderId = await client
    .collection('io.cozy.files')
    .ensureDirectoryExists(`/Settings/AALogs/${date}`)

  return existingLogsFolderId
}

const getUrl = (client: CozyClient, dirId: string, name: string): string => {
  const createdAt = new Date().toISOString()
  const modifiedAt = new Date().toISOString()

  const toURL = new URL(client.getStackClient().uri)
  toURL.pathname = `/files/${dirId}`
  toURL.searchParams.append('Name', name)
  toURL.searchParams.append('Type', 'file')
  toURL.searchParams.append('Tags', 'library')
  toURL.searchParams.append('Executable', 'false')
  toURL.searchParams.append('CreatedAt', createdAt)
  toURL.searchParams.append('UpdatedAt', modifiedAt)

  return toURL.toString()
}
