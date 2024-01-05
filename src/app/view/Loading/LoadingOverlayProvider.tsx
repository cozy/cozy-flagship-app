import React, { useState, useContext, useCallback } from 'react'

import { LoadingOverlay } from '/ui/LoadingOverlay'

interface LoadingOverlayContextValue {
  isLoading: boolean
  showOverlay: (message?: string) => void
  hideOverlay: () => void
  loadingMessage: string
}
const LoadingOverlayContext = React.createContext<
  LoadingOverlayContextValue | undefined
>(undefined)

export const useLoadingOverlay = (): LoadingOverlayContextValue => {
  const context = useContext(LoadingOverlayContext)
  if (!context) {
    throw new Error(
      'useLoadingOverlay must be used within a LoadingOverlayProvider'
    )
  }
  return context
}

interface LoadingOverlayProviderProps {
  children: React.ReactNode
}

export const LoadingOverlayProvider = ({
  children
}: LoadingOverlayProviderProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const showOverlay = useCallback((message = '') => {
    setLoadingMessage(message)
    setIsLoading(true)
  }, [])

  const hideOverlay = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
  }, [])

  return (
    <LoadingOverlayContext.Provider
      value={{ isLoading, showOverlay, hideOverlay, loadingMessage }}
    >
      {children}
      {isLoading && <LoadingOverlay loadingMessage={loadingMessage} />}
    </LoadingOverlayContext.Provider>
  )
}
