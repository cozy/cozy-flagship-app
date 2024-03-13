import { createContext, Dispatch, useContext, useEffect, useState } from 'react'

import {
  OsReceiveLogger,
  trimActionForLog,
  trimStateForLog
} from '/app/domain/osReceive'
import {
  OsReceiveState,
  OsReceiveAction,
  OsReceiveActionType,
  OsReceiveFile,
  OsReceiveFileStatus,
  FileQueueStatus
} from '/app/domain/osReceive/models/OsReceiveState'
import { getAppsForUpload } from '/app/domain/osReceive/services/OsReceiveCandidateApps'
import { AppForUpload } from '/app/domain/osReceive/models/OsReceiveCozyApp'
import { safePromise } from '/utils/safePromise'

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
    // When resetting the state, we keep the candidateApps (e.g. when the user successfully uploads a file or cancels the upload)
    // This is useful to avoid re-fetching the candidate apps when the user starts a new upload after a successful one
    // This is only persisted in the runtime state and not in the persistent storage to avoid keeping the candidate apps when the user closes the app
    // The candidate apps are fetched again when the user opens the app after closing it
    case OsReceiveActionType.SetRecoveryState:
    case OsReceiveActionType.SetInitialState:
      nextState = { ...initialState, candidateApps: state.candidateApps }
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
    case OsReceiveActionType.SetCandidateApps:
      nextState = { ...state, candidateApps: action.payload }
      break
    case OsReceiveActionType.SetFilesToShare:
      nextState = {
        ...state,
        filesToShare: action.payload
      }
      break
    default:
      break
  }

  OsReceiveLogger.info(
    `osReceiveReducer handled action ${JSON.stringify(
      trimActionForLog(action)
    )}}`
  )
  OsReceiveLogger.info('osReceiveReducer prevState', trimStateForLog(state))

  OsReceiveLogger.info('osReceiveReducer nextState', trimStateForLog(nextState))

  return nextState
}

export const initialState: OsReceiveState = {
  filesToUpload: [],
  routeToUpload: {},
  errored: false,
  candidateApps: undefined,
  filesToShare: []
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

export const useFilesQueueStatus = (): FileQueueStatus => {
  const state = useOsReceiveState()

  return {
    hasAllFilesQueued:
      state.filesToUpload.length > 0 &&
      state.filesToUpload.every(
        file => file.status === OsReceiveFileStatus.queued
      )
  }
}

export const useAppsForUpload = (): AppForUpload[] | undefined => {
  const state = useOsReceiveState()
  const [appsForUpload, setAppsForUpload] = useState<
    AppForUpload[] | undefined
  >(undefined)

  useEffect(() => {
    const computeAppsForUpload = async (): Promise<void> => {
      const { candidateApps, filesToUpload } = state

      if (!candidateApps) {
        return
      }

      const appsForUpload = await getAppsForUpload(filesToUpload, candidateApps)

      setAppsForUpload(appsForUpload)
    }

    safePromise(computeAppsForUpload)()
  }, [state])

  return appsForUpload
}
