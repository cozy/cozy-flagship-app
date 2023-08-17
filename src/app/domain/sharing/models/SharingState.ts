import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'

export enum SharingIntentStatus {
  Undetermined = 'undetermined',
  OpenedViaSharing = 'openedViaSharing',
  NotOpenedViaSharing = 'notOpenedViaSharing'
}

export enum SharingActionType {
  SetIntentStatus = 'SET_INTENT_STATUS',
  SetFilesToUpload = 'SET_FILES_TO_UPLOAD'
}

export interface SharingState {
  sharingIntentStatus: SharingIntentStatus
  filesToUpload: ReceivedFile[]
}

export type SharingAction =
  | { type: SharingActionType.SetIntentStatus; payload: SharingIntentStatus }
  | { type: SharingActionType.SetFilesToUpload; payload: ReceivedFile[] }
