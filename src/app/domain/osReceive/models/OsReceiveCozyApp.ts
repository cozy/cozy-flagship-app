export interface AcceptFromFlagshipManifest {
  _id: string
  _type: string
  accept_documents_from_flagship?: {
    accepted_mime_types: string[]
    max_number_of_files: number
    max_size_per_file_in_MB: number
    route_to_upload: string
  }
  accept_from_flagship?: boolean
  attributes: {
    accept_documents_from_flagship?: {
      accepted_mime_types: string[]
      max_number_of_files: number
      max_size_per_file_in_MB: number
      route_to_upload: string
    }
    accept_from_flagship?: boolean
  }
  slug: string
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
  reasonDisabled?: string
  routeToUpload: string
  slug: string
}
