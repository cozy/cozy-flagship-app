import { createContext, Dispatch, useContext } from 'react'

import { sharingLogger } from '/app/domain/sharing'
import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'
import {
  SharingState,
  SharingAction,
  SharingActionType,
  SharingIntentStatus,
  SharingApi
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
        ...initialState,
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

export const useSharingApi = (): SharingApi => {
  const state = useContext(SharingStateContext)
  const dispatch = useContext(SharingDispatchContext)

  if (state === undefined || dispatch === undefined) {
    throw new Error('useSharingApi must be used within a SharingProvider')
  }

  const hasFilesToHandle = (): boolean => {
    sharingLogger.info('hasFilesToHandle', state.filesToUpload)
    return state.filesToUpload.length > 0
  }

  const getFilesToHandle = (): ReceivedFile[] => {
    sharingLogger.info('getFilesToHandle', state.filesToUpload)
    return state.filesToUpload
  }

  const uploadFiles = (files: ReceivedFile[]): void => {
    sharingLogger.info('uploadFiles', files)
  }

  const resetFilesToHandle = (): void => {
    sharingLogger.info('resetFilesToHandle')
    dispatch({ type: SharingActionType.SetFilesToUpload, payload: [] })
  }

  return { hasFilesToHandle, getFilesToHandle, uploadFiles, resetFilesToHandle }
}
