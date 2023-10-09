import { createContext, Dispatch, useContext } from 'react'

import { OsReceiveLogger } from '/app/domain/osReceive'
import {
  OsReceiveState,
  OsReceiveAction,
  OsReceiveActionType,
  OsReceiveFile,
  OsReceiveFileStatus
} from '/app/domain/osReceive/models/OsReceiveState'

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
    case OsReceiveActionType.SetRecoveryState:
      nextState = initialState
      break
    case OsReceiveActionType.SetInitialState:
      nextState = initialState
      break
    case OsReceiveActionType.UpdateFileStatus: {
      const updateFile = (file: OsReceiveFile): OsReceiveFile => ({
        ...file,
        status: action.payload.status,
        handledTimestamp: action.payload.handledTimestamp
      })

      const shouldUpdateFile = (file: OsReceiveFile): boolean =>
        file.name === action.payload.name || action.payload.name === '*'

      nextState = {
        ...state,
        filesToUpload: state.filesToUpload.map(file =>
          shouldUpdateFile(file) ? updateFile(file) : file
        )
      }
      break
    }
    default:
      break
  }

  OsReceiveLogger.info(
    `osReceiveReducer handled action ${JSON.stringify(action)}}`
  )
  OsReceiveLogger.info('osReceiveReducer prevState', state)

  OsReceiveLogger.info('osReceiveReducer nextState', nextState)

  return nextState
}

export const initialState: OsReceiveState = {
  filesToUpload: [],
  routeToUpload: {},
  errored: false
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

export const useFilesToUpload = (): OsReceiveFile[] => {
  const state = useOsReceiveState()

  return state.filesToUpload.filter(
    file => file.status === OsReceiveFileStatus.toUpload
  )
}
