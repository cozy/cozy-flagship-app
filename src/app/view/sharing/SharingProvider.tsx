import React, { useReducer, ReactNode, Dispatch } from 'react'

import { ReceivedFile } from '/app/domain/sharing/models/ReceivedFile'
import { SharingIntentStatus } from '/app/domain/sharing/models/ReceivedIntent'

// 1. Define state and action types
export interface SharingState {
  SharingIntentStatus: SharingIntentStatus | null
  filesToUpload: ReceivedFile[]
  isSharingExpected: boolean
  isSharingReady: boolean
}

export type SharingAction =
  | { type: 'SET_INTENT_STATUS'; payload: SharingIntentStatus }
  | { type: 'SET_FILES_TO_UPLOAD'; payload: ReceivedFile[] }
  | { type: 'SET_SHARING_EXPECTED'; payload: boolean }
  | { type: 'SET_SHARING_READY'; payload: boolean }

// 2. Implement the reducer with types
const assertNever = (action: never): never => {
  throw new Error('Unexpected object', action)
}

export const sharingReducer = (
  state: SharingState,
  action: SharingAction
): SharingState => {
  switch (action.type) {
    case 'SET_INTENT_STATUS':
      return { ...state, SharingIntentStatus: action.payload }
    case 'SET_FILES_TO_UPLOAD':
      return { ...state, filesToUpload: action.payload }
    case 'SET_SHARING_EXPECTED':
      return { ...state, isSharingExpected: action.payload }
    case 'SET_SHARING_READY':
      return { ...state, isSharingReady: action.payload }
    default:
      return assertNever(action)
  }
}

// 3. Define the types for context
const SharingStateContext = React.createContext<SharingState | undefined>(
  undefined
)
const SharingDispatchContext = React.createContext<
  Dispatch<SharingAction> | undefined
>(undefined)

// 4. Implement the provider with types
interface SharingProviderProps {
  children: ReactNode
}

export const SharingProvider = ({
  children
}: SharingProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(sharingReducer, {
    SharingIntentStatus: null,
    filesToUpload: [],
    isSharingExpected: false,
    isSharingReady: false
  })

  return (
    <SharingStateContext.Provider value={state}>
      <SharingDispatchContext.Provider value={dispatch}>
        {children}
      </SharingDispatchContext.Provider>
    </SharingStateContext.Provider>
  )
}

// 5. Create custom hooks for easy usage
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
