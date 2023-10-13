import Minilog from 'cozy-minilog'

import { OsReceiveState } from './models/OsReceiveState'

export const OsReceiveLogger = Minilog('🗃️ OsReceiveService')

export const removeSourceProperty = (
  state: OsReceiveState
): OsReceiveState => ({
  ...state,
  filesToUpload: state.filesToUpload.map(({ source, ...rest }) => ({
    ...rest,
    source: source ? '[base64]' : undefined
  }))
})
