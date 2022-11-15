import { BiometryType } from 'react-native-biometrics'
import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'

import { useClient } from 'cozy-client'

import { LockViewProps, RouteProp } from '/screens/lock/LockScreenTypes'
import { getData, StorageKeys } from '/libs/localStore/storage'
import { getFqdnFromClient } from '/libs/client'
import { getVaultInformation } from '/libs/keychain'
import { navigate } from '/libs/RootNavigation'
import { resetUIState, StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { routes } from '/constants/routes'
import {
  ensureLockScreenUi,
  getBiometryType,
  logout,
  promptBiometry,
  tryUnlockWithPassword,
  validatePin
} from '/screens/lock/functions/lockScreenFunctions'
import { translation } from '/locales'
import { openForgotPasswordLink } from '/libs/functions/openForgotPasswordLink'

export const useLockScreenProps = (route?: RouteProp): LockViewProps => {
  const [biometryEnabled, setBiometryEnabled] = useState(false)
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'password' | 'PIN'>()
  const [passwordVisibility, _togglePasswordVisibility] = useState(false)
  const [uiError, setUiError] = useState('')
  const [isOnBackground, setIsOnBackground] = useState(false)
  const client = useClient()
  const { fqdn } = getFqdnFromClient(client)

  const onUnlock = useCallback((): void => {
    if (!route) return navigate(routes.home)

    return navigate(route.name, route.params)
  }, [route])

  const tryBiometry = useCallback((): Promise<void> => {
    return getData(StorageKeys.BiometryActivated).then(async activated => {
      if (!activated) return

      await ensureLockScreenUi()

      const { success } = await promptBiometry()

      if (success) return onUnlock()

      return
    })
  }, [onUnlock])

  useEffect(
    function showBiometryOnResume() {
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (isOnBackground && nextAppState === 'active') {
          setIsOnBackground(false)
          void tryBiometry()
        }

        if (nextAppState === 'background') {
          setIsOnBackground(true)
        }
      })

      return () => {
        subscription.remove()
      }
    },
    [isOnBackground, tryBiometry]
  )

  useEffect(() => {
    const getMode = async (): Promise<'password' | 'PIN'> =>
      (await getVaultInformation('pinCode')) ? 'PIN' : 'password'

    getMode()
      .then(value => setMode(value))
      .then(ensureLockScreenUi)
      .catch(() => setMode('password'))
  }, [])

  useEffect(() => {
    resetUIState(StatusBarStyle.Dark)

    void tryBiometry()

    void getBiometryType(type => {
      setBiometryType(type ?? null)
    })
  }, [onUnlock, tryBiometry])

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

  const tryUnlockWithPin = async (): Promise<void> =>
    (await validatePin(input))
      ? onUnlock()
      : setUiError(translation.errors.badUnlockPin)

  const toggleMode = (): void => {
    const asyncCore = async (): Promise<void> => {
      if (mode === 'PIN') {
        setMode('password')
        resetInput()
      }

      if (mode === 'password') {
        await openForgotPasswordLink(
          (client.getStackClient() as { uri: string }).uri
        )
      }
    }

    void asyncCore()
  }

  const handleBiometry = (): void => {
    const doHandleBiometry = async (): Promise<void> => {
      const { success } = await promptBiometry()
      success && onUnlock()
      // TODO: handle failure
    }

    void doHandleBiometry()
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
    tryUnlock: mode === 'password' ? tryUnlock : tryUnlockWithPin,
    fqdn,
    togglePasswordVisibility,
    passwordVisibility,
    handleBiometry
  }
}
