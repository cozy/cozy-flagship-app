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
  SetFlowErrored = 'SET_FLOW_ERRORED'
}

export interface SharingState {
  sharingIntentStatus: SharingIntentStatus
  filesToUpload: ReceivedFile[]
  routeToUpload?: { href: string; slug: string }
  errored: boolean
}

export type SharingAction =
  | { type: SharingActionType.SetIntentStatus; payload: SharingIntentStatus }
  | { type: SharingActionType.SetFilesToUpload; payload: ReceivedFile[] }
  | {
      type: SharingActionType.SetRouteToUpload
      payload: { href: string; slug: string }
    }
  | { type: SharingActionType.SetFlowErrored; payload: boolean }

export interface ServiceResponse<T> {
  result?: T
  error?: string
}
