import Minilog from 'cozy-minilog'

import { AcceptFromFlagshipManifest } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import {
  OsReceiveAction,
  OsReceiveActionType,
  OsReceiveState
} from '/app/domain/osReceive/models/OsReceiveState'

export const OsReceiveLogger = Minilog('🗃️ OsReceiveService')

export const trimActionForLog = (action: OsReceiveAction): OsReceiveAction => {
  if (action.type === OsReceiveActionType.SetCandidateApps) {
    return {
      ...action,
      payload: action.payload.map((app: AcceptFromFlagshipManifest) => ({
        name: app.name
      })) as AcceptFromFlagshipManifest[]
    }
  }
  return action
}

export const trimStateForLog = (state: OsReceiveState): OsReceiveState => ({
  ...state,
  candidateApps: state.candidateApps?.map(app => ({
    name: app.name
  })) as AcceptFromFlagshipManifest[],
  filesToUpload: state.filesToUpload.map(({ source, ...rest }) => ({
    ...rest,
    source: source ? '[base64]' : undefined
  }))
})
