import { AppState } from 'react-native'
import { BiometryType } from 'react-native-biometrics'
import type { Route } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'

import { useClient } from 'cozy-client'

import { LockViewProps } from '/app/view/Lock/LockScreenTypes'
import { getData, StorageKeys } from '/libs/localStore/storage'
import { getInstanceAndFqdnFromClient } from '/libs/client'
import { getVaultInformation } from '/libs/keychain'
import { navigate } from '/libs/RootNavigation'
import { openForgotPasswordLink } from '/libs/functions/openForgotPasswordLink'
import { routes } from '/constants/routes'
import { translation } from '/locales'
import {
  ensureLockScreenUi,
  getBiometryType,
  logout,
  promptBiometry,
  tryUnlockWithPassword,
  validatePin
} from '/app/domain/authorization/services/LockScreenService'

export const useLockScreenProps = (
  route?: Route<
    string,
    Readonly<{ key: string; name: string; path?: string | undefined }>
  >
): LockViewProps => {
  const [biometryEnabled, setBiometryEnabled] = useState(false)
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null)
  const [hasLogoutDialog, toggleLogoutDialog] = useState(false)
  const [input, setInput] = useState('')
  const [isOnBackground, setIsOnBackground] = useState(false)
  const [mode, setMode] = useState<'password' | 'PIN'>()
  const [passwordVisibility, _togglePasswordVisibility] = useState(false)
  const [uiError, setUiError] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know that the client is defined
  const client = useClient()!
  const { fqdn } = getInstanceAndFqdnFromClient(client)

  const onUnlock = useCallback((): void => {
    if (!route || Object.keys(route).length === 0) return navigate(routes.home)

    return navigate(route.name, route.params)
  }, [route])

  const tryBiometry = useCallback((): Promise<void> => {
    const handleBiometryParam = async (): Promise<void> => {
      const activated = await getData(StorageKeys.BiometryActivated)

      if (!activated) return

      await ensureLockScreenUi()

      const { success } = await promptBiometry()

      if (success) return onUnlock()

      return
    }

    return handleBiometryParam()
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
    const getMode = async (): Promise<void> => {
      try {
        const mode = (await getVaultInformation('pinCode')) ? 'PIN' : 'password'

        setMode(mode)

        await ensureLockScreenUi()
      } catch {
        setMode('password')
      }
    }

    void getMode()
  }, [])

  useEffect(() => {
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
        await openForgotPasswordLink(client.getStackClient().uri)
      }
    }

    void asyncCore()
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
    hasLogoutDialog,
    toggleLogoutDialog: (): void => toggleLogoutDialog(!hasLogoutDialog),
    uiError,
    input,
    logout: logout(client),
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
