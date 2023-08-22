import { UploadError } from '/app/domain/upload/models'

export class BackupError extends Error {
  statusCode: number | undefined

  constructor(message: string, statusCode: number | undefined) {
    const stringifiedMessage = JSON.stringify({
      message,
      statusCode
    })

    super(stringifiedMessage)
    this.name = 'BackupError'
    this.statusCode = statusCode
  }
}

export const isUploadError = (error: unknown): error is UploadError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'errors' in error &&
    Array.isArray(error.errors)
  )
}

export const isMetadataExpiredError = (error: UploadError): boolean => {
  return (
    error.statusCode === 422 &&
    error.errors[0]?.detail === 'Invalid or expired MetadataID'
  )
}

export const isQuotaExceededError = (error: UploadError): boolean => {
  return (
    error.statusCode === 413 &&
    error.errors[0]?.detail === 'The file is too big and exceeds the disk quota'
  )
}

export const isFatalError = (error: UploadError): boolean => {
  return isQuotaExceededError(error)
}
