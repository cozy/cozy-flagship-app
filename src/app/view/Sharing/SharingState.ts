import { createContext, Dispatch, useContext } from 'react'

import { OsReceiveLogger } from '/app/domain/sharing'
import {
  OsReceiveState,
  OsReceiveAction,
  OsReceiveActionType,
  OsReceiveIntentStatus
} from '/app/domain/sharing/models/SharingState'

export const OsReceiveStateContext = createContext<OsReceiveState | undefined>(
  undefined
)
export const OsReceiveDispatchContext = createContext<
  Dispatch<OsReceiveAction> | undefined
>(undefined)

export const osReceiveReducer = (
  state: OsReceiveState,
  action: OsReceiveAction
): OsReceiveState => {
  let nextState = state

  switch (action.type) {
    case OsReceiveActionType.SetIntentStatus:
      if (state.OsReceiveIntentStatus === action.payload) return state
      nextState = { ...state, OsReceiveIntentStatus: action.payload }
      break
    case OsReceiveActionType.SetFilesToUpload:
      if (state.filesToUpload === action.payload) return state
      nextState = { ...state, filesToUpload: action.payload }
      break
    case OsReceiveActionType.SetRouteToUpload:
      if (state.routeToUpload.slug === action.payload.slug) return state
      nextState = { ...state, routeToUpload: action.payload }
      break
    case OsReceiveActionType.SetFlowErrored: {
      nextState = { ...state, errored: action.payload }
      break
    }
    case OsReceiveActionType.SetFileUploaded: {
      nextState = {
        ...state,
        filesUploaded: [...state.filesUploaded, action.payload]
      }
      break
    }
    case OsReceiveActionType.SetRecoveryState:
      nextState = {
        ...initialState,
        OsReceiveIntentStatus: OsReceiveIntentStatus.NotOpenedViaOsReceive
      }
      break
    default:
      break
  }

  OsReceiveLogger.info(`osReceiveReducer handled action "${action.type}"`)
  OsReceiveLogger.info('osReceiveReducer prevState', state)
  OsReceiveLogger.info('osReceiveReducer nextState', nextState)

  return nextState
}

export const initialState: OsReceiveState = {
  OsReceiveIntentStatus: OsReceiveIntentStatus.Undetermined,
  filesToUpload: [],
  routeToUpload: {},
  errored: false,
  filesUploaded: []
}

export const useOsReceiveState = (): OsReceiveState => {
  const context = useContext(OsReceiveStateContext)
  if (context === undefined) {
    throw new Error('useOsReceiveState must be used within a OsReceiveProvider')
  }
  return context
}

export const useOsReceiveDispatch = (): Dispatch<OsReceiveAction> => {
  const context = useContext(OsReceiveDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useOsReceiveDispatch must be used within a OsReceiveProvider'
    )
  }
  return context
}
