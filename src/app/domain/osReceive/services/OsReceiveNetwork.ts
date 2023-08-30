import CozyClient, { generateWebLink, Q } from 'cozy-client'

import { UploadResult } from '/app/domain/upload/models'
import { uploadFileWithConflictStrategy } from '/app/domain/upload/services'
import { ReceivedFile } from '/app/domain/osReceive/models/ReceivedFile'
import { OsReceiveLogger } from '/app/domain/osReceive'
import { OsReceiveCozyApp } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { ServiceResponse } from '/app/domain/osReceive/models/OsReceiveState'

export const fetchOsReceiveCozyApps = {
  definition: Q('io.cozy.apps').where({
    'accept_documents_from_flagship.route_to_upload': { $exists: true },
    accept_from_flagship: true
  }),
  options: {
    as: 'io.cozy.apps/fetchSharingCozyApps'
  }
}

export const getRouteToUpload = (
  cozyApps?: OsReceiveCozyApp[],
  client?: CozyClient | null,
  appName = 'drive'
): ServiceResponse<{ href: string; slug: string }> => {
  try {
    if (!client || !Array.isArray(cozyApps) || cozyApps.length === 0) return {}

    const cozyApp = cozyApps.find(cozyApp => cozyApp.slug === appName)
    if (!cozyApp) return {}
    const hash =
      cozyApp.accept_documents_from_flagship?.route_to_upload ??
      cozyApp.attributes.accept_documents_from_flagship?.route_to_upload
    const slug = cozyApp.slug
    if (!hash || !slug) return {}

    const href = generateWebLink({
      cozyUrl: client.getStackClient().uri,
      pathname: '',
      slug,
      subDomainType: client.capabilities.flat_subdomains ? 'flat' : 'nested',
      hash: hash.replace(/^\/?#?\//, ''),
      searchParams: []
    })

    OsReceiveLogger.info('routeToUpload is', { href, slug })
    return { result: { href, slug: cozyApp.slug } }
  } catch (error) {
    OsReceiveLogger.error('Error when getting routeToUpload', error)
    return { error: 'Error determining route to upload.' }
  }
}

// Create a typeguard function to ensure the ReceivedFile to upload is valid
export const isReceivedFile = (file: unknown): file is ReceivedFile => {
  return (
    typeof file === 'object' &&
    file !== null &&
    'fileName' in file &&
    'filePath' in file &&
    'mimeType' in file
  )
}

export const uploadFiles = async (
  client: CozyClient,
  uploadUrl: string,
  media: ReceivedFile
): Promise<UploadResult> => {
  if (!isReceivedFile(media)) {
    throw new Error('Invalid file to upload')
  }

  const token = client.getStackClient().token.accessToken

  if (!token) {
    throw new Error('uploadFiles: token is undefined, aborting')
  }

  return uploadFileWithConflictStrategy({
    url: uploadUrl,
    token,
    filename: media.fileName,
    filepath: media.filePath,
    mimetype: media.mimeType
  })
}
