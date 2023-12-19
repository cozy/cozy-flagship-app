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
    case OsReceiveActionType.SetCandidateApps:
      nextState = { ...state, candidateApps: action.payload }
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
  candidateApps: undefined
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
