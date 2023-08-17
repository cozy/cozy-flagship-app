import React, { useReducer, ReactNode, Dispatch, useEffect } from 'react'

import {
  SharingState,
  SharingAction,
  SharingIntentStatus,
  SharingActionType
} from '/app/domain/sharing/models/SharingState'
import { handleReceivedFiles } from '/app/domain/sharing/services/SharingData'
import { handleSharing } from '/app/domain/sharing/services/SharingStatus'

const assertNever = (action: never): never => {
  throw new Error('Unexpected object', action)
}

export const sharingReducer = (
  state: SharingState,
  action: SharingAction
): SharingState => {
  switch (action.type) {
    case SharingActionType.SetIntentStatus:
      return { ...state, sharingIntentStatus: action.payload }
    case SharingActionType.SetFilesToUpload:
      return { ...state, filesToUpload: action.payload }
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
  const [state, dispatch] = useReducer(sharingReducer, {
    sharingIntentStatus: SharingIntentStatus.Undetermined,
    filesToUpload: []
  })

  useEffect(() => {
    const cleanupSharingIntent = handleSharing(
      (status: SharingIntentStatus) => {
        dispatch({ type: SharingActionType.SetIntentStatus, payload: status })
      }
    )

    handleReceivedFiles(files => {
      dispatch({ type: SharingActionType.SetFilesToUpload, payload: files })
    })

    return () => {
      cleanupSharingIntent()
    }
  }, [dispatch])

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
