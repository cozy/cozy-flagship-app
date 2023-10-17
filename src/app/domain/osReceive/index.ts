import Minilog from 'cozy-minilog'

import { AcceptFromFlagshipManifest } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { OsReceiveState } from '/app/domain/osReceive/models/OsReceiveState'

export const OsReceiveLogger = Minilog('🗃️ OsReceiveService')

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
