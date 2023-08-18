export interface SharingCozyApp {
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
