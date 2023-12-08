import { Platform } from 'react-native'
import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics'
import { Toast } from 'react-native-toast-message/lib/src/Toast'

import CozyClient from 'cozy-client'

import { FaceId } from '/ui/Icons/FaceId'
import { Fingerprint } from '/ui/Icons/Fingerprint'
import { asyncLogout } from '/libs/intents/localMethods'
import { doHashPassword } from '/libs/functions/passwordHelpers'
import { getInstanceAndFqdnFromClient } from '/libs/client'
import {
  getVaultInformation,
  removeVaultInformation,
  saveVaultInformation
} from '/libs/keychain'
import { hideSplashScreen } from '/app/theme/SplashScreenService'
import { setLockScreenUI } from '/app/domain/authorization/events/LockScreenUiManager'
import { UnlockWithPassword } from '/app/domain/authentication/models/User'
import { t } from '/locales/i18n'
import { LoginData } from '/screens/login/components/types'
import { getErrorMessage, isHttpError } from '/libs/functions/getErrorMessage'
import { AuthLogger } from '/app/domain/authorization'

const rnBiometrics = new ReactNativeBiometrics()

const hashInputPassword = async (
  client: CozyClient,
  input: string
): Promise<LoginData> => {
  const { fqdn } = getInstanceAndFqdnFromClient(client)
  const { KdfIterations } = await client
    .getStackClient()
    .fetchJSON<{ KdfIterations: number }>('GET', '/public/prelogin')
  return doHashPassword({ password: input }, fqdn, KdfIterations)
}

const checkCachedPassword = async (
  client: CozyClient,
  hashedInputPassword: LoginData,
  storedHash: string
): Promise<void> => {
  await client
    .getStackClient()
    .fetchJSON('POST', '/settings/passphrase/check', {
      passphrase: storedHash
    })

  if (hashedInputPassword.passwordHash !== storedHash) {
    throw new Error('Cached password mismatch')
  }
}

const checkInputPassword = async (
  client: CozyClient,
  hashedInputPassword: LoginData
): Promise<void> => {
  await client
    .getStackClient()
    .fetchJSON('POST', '/settings/passphrase/check', {
      passphrase: hashedInputPassword.passwordHash
    })

  await updateCachedPassword(hashedInputPassword)
}

const updateCachedPassword = async (
  hashedInputPassword: LoginData
): Promise<void> => {
  await removeVaultInformation('passwordHash')
  await saveVaultInformation('passwordHash', hashedInputPassword.passwordHash)
}

const handleInvalidCachedPassword = async (
  client: CozyClient,
  hashedInputPassword: LoginData,
  onSuccess: () => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    await checkInputPassword(client, hashedInputPassword)
    await updateCachedPassword(hashedInputPassword)
    return onSuccess() // Cached password was incorrect, input password is correct
  } catch (inputError) {
    if (isHttpError(inputError)) {
      if (inputError.status === 403) {
        return onFailure(t('errors.badUnlockPassword')) // Cached password is incorrect, input password is incorrect
      } else {
        return onFailure(t('errors.serverError')) // Unexpected server error
      }
    } else {
      return onFailure(t('errors.unknown_error')) // Unexpected error
    }
  }
}

export const validatePassword = async ({
  client,
  input,
  onSuccess,
  onFailure
}: {
  client: CozyClient
  input: string
  onSuccess: () => void
  onFailure: (error: string) => void
}): Promise<void> => {
  try {
    const hashedInputPassword = await hashInputPassword(client, input)
    const storedHash = (await getVaultInformation('passwordHash')) as string

    try {
      await checkCachedPassword(client, hashedInputPassword, storedHash)
      return onSuccess() // Cached password is correct, input password is correct
    } catch (cacheError) {
      if (isHttpError(cacheError)) {
        if (cacheError.status === 403) {
          return await handleInvalidCachedPassword(
            client,
            hashedInputPassword,
            onSuccess,
            onFailure
          ) // Cached password is incorrect, changing flow to input password check
        } else {
          return onFailure(t('errors.serverError')) // Unexpected server error
        }
      } else if (getErrorMessage(cacheError) === 'Cached password mismatch') {
        return onFailure(t('errors.badUnlockPassword')) // Cached password is correct, input password is incorrect
      } else {
        return onFailure(t('errors.unknown_error')) // Unexpected error
      }
    }
  } catch (error) {
    return onFailure(t('errors.unknown_error')) // Unexpected error
  }
}

export const validatePin = async (pinCode: string): Promise<boolean> =>
  (await getVaultInformation('pinCode')) === pinCode

export const logout = (
  client: CozyClient,
  toggleLogoutDialog: (arg: boolean) => void
): (() => void) => {
  return () => {
    const asyncClosure = async (): Promise<void> => {
      try {
        await asyncLogout(client)
      } catch (error) {
        AuthLogger.error('🔏 logout() error:', error)

        toggleLogoutDialog(false)

        Toast.show({
          type: 'error',
          text1: t('errors.unknown_error')
        })
      }
    }

    void asyncClosure()
  }
}

export const getBiometryType = async (
  callback: (type?: BiometryType) => void
): Promise<void> =>
  callback((await rnBiometrics.isSensorAvailable()).biometryType)

export const tryUnlockWithPassword = async ({
  client,
  input,
  onSuccess,
  onFailure
}: UnlockWithPassword): Promise<void> => {
  await validatePassword({
    client,
    input,
    onSuccess,
    onFailure
  })
}

export const getBiometryIcon = (
  type: BiometryType
): typeof Fingerprint | typeof FaceId => {
  switch (type) {
    case 'TouchID':
    case 'Biometrics':
      return Fingerprint

    case 'FaceID':
      return FaceId
  }
}

export const promptBiometry = async (): Promise<{
  success: boolean
  error?: string
}> => {
  if (Platform.OS === 'android') {
    await setLockScreenUI({
      bottomOverlay: 'rgba(0,0,0,0.5)',
      topOverlay: 'rgba(0,0,0,0.5)'
    })
  }

  const promptResult = await rnBiometrics.simplePrompt({
    promptMessage: t('screens.lock.promptTitle'),
    cancelButtonText: t('screens.lock.promptCancel')
  })

  if (Platform.OS === 'android') {
    await setLockScreenUI({
      bottomOverlay: 'transparent',
      topOverlay: 'transparent'
    })
  }

  return promptResult
}

export const ensureLockScreenUi = async (): Promise<void> => {
  await setLockScreenUI({
    bottomOverlay: 'transparent',
    topOverlay: 'transparent'
  })

  AuthLogger.info('🔏 ensureLockScreenUi() hiding splash screen')
  await hideSplashScreen()
}
