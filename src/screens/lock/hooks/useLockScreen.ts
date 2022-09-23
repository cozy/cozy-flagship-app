import { useEffect, useState } from 'react'

import { useClient } from 'cozy-client'

import { LockViewProps, RouteProp } from '/screens/lock/LockScreenTypes'
import { navigate } from '/libs/RootNavigation'
import {
  logout,
  validatePassword
} from '/screens/lock/functions/lockScreenFunctions'
import { routes } from '/constants/routes'
import { resetUIState, StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { getFqdnFromClient } from '/libs/client'

export const useLockScreenProps = (route?: RouteProp): LockViewProps => {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'password' | 'PIN'>('password')
  const [uiError, setUiError] = useState('')
  const [passwordVisibility, togglePasswordVisibility] = useState(false)
  const client = useClient()
  const { fqdn } = getFqdnFromClient(client)

  useEffect(() => {
    resetUIState(StatusBarStyle.Dark)
  }, [])

  const handleInput = (text: string): void => {
    setUiError('')
    setInput(text)
  }

  const onUnlock = (): void => {
    if (!route) return navigate(routes.home)

    return navigate(route.name, route.params)
  }

  const tryUnlock = (): void => {
    const asyncCore = async (): Promise<void> => {
      await validatePassword({
        client,
        input,
        onSuccess: onUnlock,
        onFailure: setUiError
      })
    }

    void asyncCore()
  }

  const toggleMode = (): void => {
    setMode(mode === 'password' ? 'PIN' : 'password')
    setInput('')
  }

  return {
    uiError,
    input,
    logout,
    mode,
    handleInput,
    toggleMode,
    tryUnlock,
    fqdn,
    togglePasswordVisibility: (): void =>
      togglePasswordVisibility(!passwordVisibility),
    passwordVisibility
  }
}
