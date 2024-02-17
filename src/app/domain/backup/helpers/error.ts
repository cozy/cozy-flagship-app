import {
  NetworkError,
  CancellationError,
  UploadError
} from '/app/domain/upload/models'

export class BackupError extends Error {
  textMessage: string
  statusCode: number | undefined

  constructor(message: string, statusCode?: number) {
    const stringifiedMessage = JSON.stringify({
      message,
      statusCode
    })

    super(stringifiedMessage)
    this.name = 'BackupError'
    this.textMessage = message
    this.statusCode = statusCode
  }
}

export const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof NetworkError ||
    (error instanceof Error && error.message === 'Network request failed')
  )
}

export const isCancellationError = (error: unknown): boolean => {
  return error instanceof CancellationError
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

export const isQuotaExceededError = (error: UploadError): boolean => {
  return (
    error.statusCode === 413 &&
    error.errors[0]?.detail === 'The file is too big and exceeds the disk quota'
  )
}

export const isFileTooBigError = (error: UploadError): boolean => {
  return (
    error.statusCode === 413 &&
    error.errors[0]?.detail ===
      'The file is too big and exceeds the filesystem maximum file size'
  )
}

export const shouldRetryCallbackBackup = (error: Error): boolean => {
  const notRetryableError =
    (isUploadError(error) &&
      (isQuotaExceededError(error) || isFileTooBigError(error))) ||
    isCancellationError(error)

  return !notRetryableError
}
