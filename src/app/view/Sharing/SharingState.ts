import { createContext, Dispatch, useContext } from 'react'

import { sharingLogger } from '/app/domain/sharing'
import {
  SharingState,
  SharingAction,
  SharingActionType,
  SharingIntentStatus
} from '/app/domain/sharing/models/SharingState'

export const SharingStateContext = createContext<SharingState | undefined>(
  undefined
)
export const SharingDispatchContext = createContext<
  Dispatch<SharingAction> | undefined
>(undefined)

export const sharingReducer = (
  state: SharingState,
  action: SharingAction
): SharingState => {
  let nextState = state

  switch (action.type) {
    case SharingActionType.SetIntentStatus:
      if (state.sharingIntentStatus === action.payload) return state
      nextState = { ...state, sharingIntentStatus: action.payload }
      break
    case SharingActionType.SetFilesToUpload:
      if (state.filesToUpload === action.payload) return state
      nextState = { ...state, filesToUpload: action.payload }
      break
    case SharingActionType.SetRouteToUpload:
      if (state.routeToUpload?.slug === action.payload.slug) return state
      nextState = { ...state, routeToUpload: action.payload }
      break
    case SharingActionType.SetFlowErrored: {
      nextState = { ...state, errored: action.payload }
      break
    }
    case SharingActionType.SetRecoveryState:
      nextState = {
        ...state,
        filesToUpload: [],
        routeToUpload: undefined,
        sharingIntentStatus: SharingIntentStatus.NotOpenedViaSharing
      }
      break
    default:
      break
  }

  sharingLogger.info(`sharingReducer handled action "${action.type}"`)
  sharingLogger.info('sharingReducer prevState', state)
  sharingLogger.info('sharingReducer nextState', nextState)

  return nextState
}

export const initialState: SharingState = {
  sharingIntentStatus: SharingIntentStatus.Undetermined,
  filesToUpload: [],
  routeToUpload: undefined,
  errored: false
}

export const useSharingState = (): SharingState => {
  const context = useContext(SharingStateContext)
  if (context === undefined) {
    throw new Error('useSharingState must be used within a SharingProvider')
  }
  return context
}

export const useSharingDispatch = (): Dispatch<SharingAction> => {
  const context = useContext(SharingDispatchContext)
  if (context === undefined) {
    throw new Error('useSharingDispatch must be used within a SharingProvider')
  }
  return context
}
