import React, { useReducer, ReactNode, Dispatch, useEffect } from 'react'

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
import { useSession } from '/hooks/useSession'

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
  const session = useSession()
  const [state, dispatch] = useReducer(sharingReducer, {
    sharingIntentStatus: SharingIntentStatus.Undetermined,
    filesToUpload: [],
    routeToUpload: undefined
  })
  const { data: fetchedApps } = useQuery(
    fetchSharingCozyApps.definition,
    fetchSharingCozyApps.options
  )

  useEffect(() => {
    if (client === null) return

    const route = getRouteToUpload(
      fetchedApps as SharingCozyApp[],
      client,
      session
    )

    if (route !== undefined && route.href !== state.routeToUpload?.slug) {
      dispatch({ type: SharingActionType.SetRouteToUpload, payload: route })
    }
  }, [client, fetchedApps, state.routeToUpload, session])

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
