import { Q } from 'cozy-client'

interface AcceptDocumentsFromFlagship {
  accepted_mime_types: string[]
  max_number_of_files: number
  max_size_per_file_in_MB: number
  route_to_upload: string
}

export interface AcceptFromFlagshipManifest {
  _id: string
  _type: string
  accept_documents_from_flagship?: AcceptDocumentsFromFlagship
  accept_from_flagship?: boolean
  attributes: {
    accept_documents_from_flagship?: AcceptDocumentsFromFlagship
    accept_from_flagship?: boolean
  }
  name: string
  slug: string
}

export interface WillAcceptFromFlagshipManifest
  extends AcceptFromFlagshipManifest {
  accept_documents_from_flagship: AcceptDocumentsFromFlagship
  accept_from_flagship: true
  attributes: {
    accept_documents_from_flagship: AcceptDocumentsFromFlagship
    accept_from_flagship: boolean
  }
  reasonDisabled: string[] | undefined
}

export const isWillAcceptFromFlagshipManifest = (
  app: AcceptFromFlagshipManifest
): app is WillAcceptFromFlagshipManifest => {
  return (
    app.accept_from_flagship === true &&
    app.accept_documents_from_flagship !== undefined
  )
}

/**
 * Available apps when uploading files
 *
 * @property {string} name - Translated name of the app to display
 * @property {string} reasonDisabled - Translated reason why the app is disabled (if applicable)
 * @property {string} routeToUpload - Route to upload files to the app
 * @property {string} slug - Slug of the app, used to identify it and find its icon
 */
export interface AppForUpload {
  name: string
  reasonDisabled: string[] | undefined
  routeToUpload: string
  slug: string
}

export const fetchOsReceiveCozyApps = {
  definition: Q('io.cozy.apps'),
  options: {
    as: 'io.cozy.apps/accept_from_flagship'
  }
}

export interface FileMetadata {
  url: string
  name: string
}
