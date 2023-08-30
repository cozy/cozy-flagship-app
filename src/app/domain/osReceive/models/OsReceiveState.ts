import { ReceivedFile } from '/app/domain/osReceive/models/ReceivedFile'

export enum OsReceiveIntentStatus {
  Undetermined = 'undetermined',
  OpenedViaOsReceive = 'openedViaOsReceive',
  NotOpenedViaOsReceive = 'notOpenedViaOsReceive'
}

export enum OsReceiveActionType {
  SetIntentStatus = 'SET_INTENT_STATUS',
  SetFilesToUpload = 'SET_FILES_TO_UPLOAD',
  SetRouteToUpload = 'SET_ROUTE_TO_UPLOAD',
  SetFlowErrored = 'SET_FLOW_ERRORED',
  SetRecoveryState = 'SET_RECOVERY_STATE',
  SetFileUploaded = 'SET_FILE_UPLOADED'
}

export interface OsReceiveState {
  OsReceiveIntentStatus: OsReceiveIntentStatus
  filesToUpload: ReceivedFile[]
  routeToUpload: { href?: string; slug?: string }
  errored: boolean
  filesUploaded: ReceivedFile[]
}

export type OsReceiveAction =
  | {
      type: OsReceiveActionType.SetIntentStatus
      payload: OsReceiveIntentStatus
    }
  | { type: OsReceiveActionType.SetFilesToUpload; payload: ReceivedFile[] }
  | {
      type: OsReceiveActionType.SetRouteToUpload
      payload: { href: string; slug: string }
    }
  | { type: OsReceiveActionType.SetFlowErrored; payload: boolean }
  | { type: OsReceiveActionType.SetRecoveryState }
  | { type: OsReceiveActionType.SetFileUploaded; payload: ReceivedFile }

export interface ServiceResponse<T> {
  result?: T
  error?: string
}

export interface OsReceiveApi {
  getFilesToUpload: () => Promise<ReceivedFile[]>
  hasFilesToHandle: () => Promise<UploadStatus>
  uploadFiles: (arg: string) => Promise<boolean>
  resetFilesToHandle: () => Promise<boolean>
}

export interface UploadStatus {
  filesToHandle: OsReceiveState['filesToUpload']
  remainingFiles: number
  totalFiles: number
  uploadedFiles: OsReceiveState['filesUploaded']
  uploading: boolean
}
