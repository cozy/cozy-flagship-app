import React, { ReactNode, useCallback, useEffect } from 'react'

import { ErrorToaster } from '/app/view/Error/ErrorToaster'

interface ErrorState {
  message: string | null
}

export const ErrorStateContext = React.createContext<ErrorState>({
  message: null
})
export const ErrorDispatchContext = React.createContext<
  React.Dispatch<React.SetStateAction<string | null>>
>(() => {
  // eslint-disable-next-line no-console
  console.warn('ErrorDispatchContext used outside of ErrorProvider.')
})

export const ErrorProvider = ({
  children
}: {
  children: ReactNode
}): JSX.Element => {
  const [error, setError] = React.useState<string | null>(null)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <ErrorStateContext.Provider value={{ message: error }}>
      <ErrorDispatchContext.Provider value={setError}>
        {error ? <ErrorToaster /> : null}
        {children}
      </ErrorDispatchContext.Provider>
    </ErrorStateContext.Provider>
  )
}

interface ErrorHook {
  error: ErrorState
  setError: React.Dispatch<React.SetStateAction<string | null>>
  handleError: (errorMessage: string, callback?: () => void) => void
}

export const useError = (): ErrorHook => {
  const error = React.useContext(ErrorStateContext)
  const setError = React.useContext(ErrorDispatchContext)

  const handleError = useCallback(
    (errorMessage: string, callback?: () => void): void => {
      setError(errorMessage)
      callback?.()
    },
    [setError]
  )

  return { error, setError, handleError }
}
