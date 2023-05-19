import React from 'react'

import { getErrorMessage } from 'cozy-intent'

interface PasswordState {
  errorMessage?: string
  readonly: boolean
  setError: (error: unknown) => void
  setReadonly: () => void
}

export const usePasswordState = (): PasswordState => {
  const [errorMessage, _setError] = React.useState<string>()
  const [readonly, _setReadonly] = React.useState<boolean>(false)

  const setError = (error: unknown): void => {
    _setError(getErrorMessage(error))
  }
  const setReadonly = (): void => {
    _setReadonly(true)
  }

  return {
    errorMessage,
    readonly,
    setError,
    setReadonly
  }
}
