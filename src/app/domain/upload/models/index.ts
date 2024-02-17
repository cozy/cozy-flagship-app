import { StackErrors, IOCozyFile } from 'cozy-client'

/*
  Disclaimer : This service is linked to cozy-stack
  - we accept only a Bearer token
  - we parse results to return IOCozyFile
  - we parse errors to return StackErrors
*/
export interface UploadParams {
  url: string
  token: string
  filename: string
  filepath: string
  mimetype: string
  notification?: {
    onProgressTitle: string
    onProgressMessage: string
  }
  retry?: Retry
}

interface Retry {
  nRetry: number
  shouldRetryCallback: (error: Error) => boolean
}

// These type is incomplete there is more information in data
export interface UploadResult {
  statusCode: number
  data: IOCozyFile
}

export type UploadError = {
  statusCode: number
} & StackErrors

export class NetworkError extends Error {
  constructor() {
    super()
    this.name = 'NetworkError'
  }
}

export class CancellationError extends Error {
  constructor() {
    super()
    this.name = 'CancellationError'
  }
}
