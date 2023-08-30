import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'

export enum SharingIntentStatus {
  Undetermined = 'undetermined',
  OpenedViaSharing = 'openedViaSharing',
  NotOpenedViaSharing = 'notOpenedViaSharing'
}

export enum SharingActionType {
  SetIntentStatus = 'SET_INTENT_STATUS',
  SetFilesToUpload = 'SET_FILES_TO_UPLOAD',
  SetRouteToUpload = 'SET_ROUTE_TO_UPLOAD',
  SetFlowErrored = 'SET_FLOW_ERRORED',
  SetRecoveryState = 'SET_RECOVERY_STATE',
  SetFileUploaded = 'SET_FILE_UPLOADED'
}

export interface SharingState {
  sharingIntentStatus: SharingIntentStatus
  filesToUpload: ReceivedFile[]
  routeToUpload: { href?: string; slug?: string }
  errored: boolean
  filesUploaded: ReceivedFile[]
}

export type SharingAction =
  | { type: SharingActionType.SetIntentStatus; payload: SharingIntentStatus }
  | { type: SharingActionType.SetFilesToUpload; payload: ReceivedFile[] }
  | {
      type: SharingActionType.SetRouteToUpload
      payload: { href: string; slug: string }
    }
  | { type: SharingActionType.SetFlowErrored; payload: boolean }
  | { type: SharingActionType.SetRecoveryState }
  | { type: SharingActionType.SetFileUploaded; payload: ReceivedFile }

export interface ServiceResponse<T> {
  result?: T
  error?: string
}

export interface SharingApi {
  getFilesToUpload: () => Promise<ReceivedFile[]>
  hasFilesToHandle: () => Promise<UploadStatus>
  uploadFiles: (arg: string) => Promise<boolean>
  resetFilesToHandle: () => Promise<boolean>
}

export interface UploadStatus {
  filesToHandle: SharingState['filesToUpload']
  remainingFiles: number
  totalFiles: number
  uploadedFiles: SharingState['filesUploaded']
  uploading: boolean
}
