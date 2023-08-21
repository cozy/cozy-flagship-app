import React, {
  useReducer,
  ReactNode,
  Dispatch,
  useEffect,
  useCallback
} from 'react'

import { useClient, useQuery } from 'cozy-client'

import { SharingCozyApp } from '/app/domain/sharing/models/SharingCozyApp'
import {
  SharingState,
  SharingAction,
  SharingIntentStatus,
  SharingActionType
} from '/app/domain/sharing/models/SharingState'
import { handleReceivedFiles } from '/app/domain/sharing/services/SharingData'
import {
  fetchSharingCozyApps,
  getRouteToUpload
} from '/app/domain/sharing/services/SharingNetwork'
import { handleSharing } from '/app/domain/sharing/services/SharingStatus'
import { useError } from '/app/view/Error/ErrorProvider'

const assertNever = (action: never): never => {
  throw new Error('Unexpected object', action)
}

export const sharingReducer = (
  state: SharingState,
  action: SharingAction
): SharingState => {
  switch (action.type) {
    case SharingActionType.SetIntentStatus:
      if (state.sharingIntentStatus === action.payload) return state
      return { ...state, sharingIntentStatus: action.payload }
    case SharingActionType.SetFilesToUpload:
      if (state.filesToUpload === action.payload) return state
      return { ...state, filesToUpload: action.payload }
    case SharingActionType.SetRouteToUpload:
      if (state.routeToUpload?.slug === action.payload.slug) return state
      return { ...state, routeToUpload: action.payload }
    case SharingActionType.SetFlowErrored: {
      return { ...state, errored: action.payload }
    }
    default:
      return assertNever(action)
  }
}

const SharingStateContext = React.createContext<SharingState | undefined>(
  undefined
)
const SharingDispatchContext = React.createContext<
  Dispatch<SharingAction> | undefined
>(undefined)

interface SharingProviderProps {
  children: ReactNode
}

export const SharingProvider = ({
  children
}: SharingProviderProps): JSX.Element => {
  const client = useClient()
  const [state, dispatch] = useReducer(sharingReducer, {
    sharingIntentStatus: SharingIntentStatus.Undetermined,
    filesToUpload: [],
    routeToUpload: undefined,
    errored: false
  })
  const { data } = useQuery(
    fetchSharingCozyApps.definition,
    fetchSharingCozyApps.options
  ) as { data?: SharingCozyApp[] | [] }
  const { handleError } = useError()

  const isProcessed = useCallback(
    (): boolean => state.filesToUpload.length > 1 || state.errored,
    [state.filesToUpload, state.errored]
  )
  const hasData = useCallback(
    (): boolean => Boolean(client && data && data.length > 0),
    [client, data]
  )

  useEffect(() => {
    if (isProcessed() || !hasData()) return
    const { result, error } = getRouteToUpload(data, client)

    if (error) {
      dispatch({ type: SharingActionType.SetFlowErrored, payload: true })
      handleError(error)
    } else if (result !== undefined) {
      dispatch({ type: SharingActionType.SetRouteToUpload, payload: result })
    }
  }, [client, data, handleError, hasData, isProcessed])

  useEffect(() => {
    const cleanupSharingIntent = handleSharing(
      (status: SharingIntentStatus) => {
        dispatch({ type: SharingActionType.SetIntentStatus, payload: status })
      }
    )

    const cleanupReceivedFiles = handleReceivedFiles(files => {
      dispatch({ type: SharingActionType.SetFilesToUpload, payload: files })
    })

    return () => {
      cleanupReceivedFiles()
      cleanupSharingIntent()
    }
  }, [])

  return (
    <SharingStateContext.Provider value={state}>
      <SharingDispatchContext.Provider value={dispatch}>
        {children}
      </SharingDispatchContext.Provider>
    </SharingStateContext.Provider>
  )
}

export const useSharingState = (): SharingState => {
  const context = React.useContext(SharingStateContext)
  if (context === undefined) {
    throw new Error('useSharingState must be used within a SharingProvider')
  }
  return context
}

export const useSharingDispatch = (): Dispatch<SharingAction> => {
  const context = React.useContext(SharingDispatchContext)
  if (context === undefined) {
    throw new Error('useSharingDispatch must be used within a SharingProvider')
  }
  return context
}
