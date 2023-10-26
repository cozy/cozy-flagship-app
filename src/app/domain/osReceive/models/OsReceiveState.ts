import { AcceptFromFlagshipManifest } from './OsReceiveCozyApp'

import { ReceivedFile } from '/app/domain/osReceive/models/ReceivedFile'

export enum OsReceiveActionType {
  SetFilesToUpload = 'SET_FILES_TO_UPLOAD',
  SetRouteToUpload = 'SET_ROUTE_TO_UPLOAD',
  SetFlowErrored = 'SET_FLOW_ERRORED',
  SetRecoveryState = 'SET_RECOVERY_STATE',
  SetInitialState = 'SET_INITIAL_STATE',
  UpdateFileStatus = 'UPDATE_FILE_STATUS',
  SetCandidateApps = 'SET_CANDIDATE_APPS'
}

export enum OsReceiveFileStatus {
  toUpload,
  uploading,
  uploaded,
  error,
  queued
}

export interface OsReceiveFile {
  name: string
  file: ReceivedFile
  status: OsReceiveFileStatus
  handledTimestamp?: number // Unix timestamp representing when the file was handled
  source?: string // base64 of the file content
  type?: string // mimetype of the file
}

export interface OsReceiveState {
  filesToUpload: OsReceiveFile[]
  routeToUpload: { href?: string; slug?: string }
  errored: boolean
  candidateApps?: AcceptFromFlagshipManifest[]
}

export type OsReceiveAction =
  | { type: OsReceiveActionType.SetFilesToUpload; payload: OsReceiveFile[] }
  | {
      type: OsReceiveActionType.SetRouteToUpload
      payload: { href: string; slug: string }
    }
  | { type: OsReceiveActionType.SetFlowErrored; payload: boolean }
  | { type: OsReceiveActionType.SetRecoveryState }
  | { type: OsReceiveActionType.SetInitialState }
  | {
      type: OsReceiveActionType.UpdateFileStatus
      payload: Omit<OsReceiveFile, 'file'>
    }
  | {
      type: OsReceiveActionType.SetCandidateApps
      payload: AcceptFromFlagshipManifest[]
    }

export interface ServiceResponse<T> {
  result?: T
  error?: string
}

export interface OsReceiveApiMethods {
  getFilesToHandle: (
    base64: boolean,
    state: OsReceiveState
  ) => Promise<OsReceiveFile[]>
  hasFilesToHandle: () => Promise<UploadStatus>
  uploadFile: (arg: string) => Promise<void>
  resetFilesToHandle: () => Promise<boolean>
  cancelUploadByCozyApp: () => boolean
}

export interface UploadStatus {
  filesToHandle: OsReceiveState['filesToUpload']
}
