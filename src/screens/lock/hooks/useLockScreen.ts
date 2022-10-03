import { useCallback, useEffect, useState } from 'react'
import { BiometryType } from 'react-native-biometrics'

import { useClient } from 'cozy-client'

import { LockViewProps, RouteProp } from '/screens/lock/LockScreenTypes'
import { navigate } from '/libs/RootNavigation'
import {
  getBiometryType,
  logout,
  promptBiometry,
  tryUnlockWithPassword
} from '/screens/lock/functions/lockScreenFunctions'
import { routes } from '/constants/routes'
import { resetUIState, StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { getFqdnFromClient } from '/libs/client'
import { getData, StorageKeys } from '/libs/localStore/storage'

export const useLockScreenProps = (route?: RouteProp): LockViewProps => {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'password' | 'PIN'>('password')
  const [uiError, setUiError] = useState('')
  const [passwordVisibility, _togglePasswordVisibility] = useState(false)
  const client = useClient()
  const { fqdn } = getFqdnFromClient(client)
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null)
  const [biometryEnabled, setBiometryEnabled] = useState(false)

  const onUnlock = useCallback((): void => {
    if (!route) return navigate(routes.home)

    return navigate(route.name, route.params)
  }, [route])

  useEffect(() => {
    resetUIState(StatusBarStyle.Dark)

    void getData(StorageKeys.BiometryActivated).then(async activated => {
      if (!activated) return

      const { success } = await promptBiometry()

      if (success) return onUnlock()

      return activated
    })

    void getBiometryType(type => {
      setBiometryType(type ?? null)
    })
  }, [onUnlock])

  useEffect(
    () =>
      void (async (): Promise<void> =>
        setBiometryEnabled(
          Boolean(await getData(StorageKeys.BiometryActivated))
        ))(),
    [biometryEnabled]
  )

  const handleInput = (text: string): void => {
    resetError()
    setInput(text)
  }

  const tryUnlock = (): void =>
    void tryUnlockWithPassword({
      client,
      input,
      onSuccess: onUnlock,
      onFailure: setUiError
    })

  const toggleMode = (): void => {
    setMode(mode === 'password' ? 'PIN' : 'password')
    resetInput()
  }

  const handleBiometry = async (): Promise<void> => {
    const { success } = await promptBiometry()
    success && onUnlock()
    // TODO: handle failure
  }

  const togglePasswordVisibility = (): void =>
    _togglePasswordVisibility(!passwordVisibility)

  const resetInput = (): void => setInput('')
  const resetError = (): void => setUiError('')

  return {
    biometryEnabled,
    biometryType,
    uiError,
    input,
    logout,
    mode,
    handleInput,
    toggleMode,
    tryUnlock,
    fqdn,
    togglePasswordVisibility,
    passwordVisibility,
    handleBiometry
  }
}
