import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics'
import { Platform } from 'react-native'

import { FaceId } from '/ui/Icons/FaceId'
import { Fingerprint } from '/ui/Icons/Fingerprint'
import { asyncLogout } from '/libs/intents/localMethods'
import { doHashPassword } from '/libs/functions/passwordHelpers'
import { getFqdnFromClient } from '/libs/client'
import { getVaultInformation } from '/libs/keychain'
import { translation } from '/locales'
import { setFlagshipUI } from '/libs/intents/setFlagshipUI'
import { hideSplashScreen } from '/libs/services/SplashScreenService'

const rnBiometrics = new ReactNativeBiometrics()

interface CozyClient {
  getStackClient: () => {
    uri: string
    fetchJSON: <T>(method: string, path: string) => Promise<T>
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
  onFailure: (reason: string) => void
}): Promise<void> => {
  const { fqdn } = getFqdnFromClient(client)

  const { KdfIterations } = await client
    .getStackClient()
    .fetchJSON<{ KdfIterations: number }>('GET', '/public/prelogin')

  const hashedPassword = await doHashPassword(
    { password: input },
    fqdn,
    KdfIterations
  )

  const storedHash = await getVaultInformation('passwordHash')

  if (hashedPassword.passwordHash === storedHash) {
    try {
      return onSuccess()
    } catch (error) {
      return onFailure(translation.errors.unknown_error)
    }
  }

  return onFailure(translation.errors.badUnlockPassword)
}

export const validatePin = async (pinCode: string): Promise<boolean> =>
  (await getVaultInformation('pinCode')) === pinCode

export const logout = (): void => void asyncLogout()

export const getBiometryType = async (
  callback: (type?: BiometryType) => void
): Promise<void> =>
  callback((await rnBiometrics.isSensorAvailable()).biometryType)

interface UnlockWithPassword {
  client: CozyClient
  input: string
  onSuccess: () => void
  onFailure: (reason: string) => void
}

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
    await setFlagshipUI(
      {
        bottomOverlay: 'rgba(0,0,0,0.5)',
        topOverlay: 'rgba(0,0,0,0.5)'
      },
      'promptBiometry'
    )
  }

  const promptResult = await rnBiometrics.simplePrompt({
    promptMessage: translation.screens.lock.promptTitle,
    cancelButtonText: translation.screens.lock.promptCancel
  })

  if (Platform.OS === 'android') {
    await setFlagshipUI(
      {
        bottomOverlay: 'transparent',
        topOverlay: 'transparent'
      },
      'promptBiometry'
    )
  }

  return promptResult
}

export const ensureLockScreenUi = async (): Promise<void> => {
  await setFlagshipUI(
    {
      bottomOverlay: 'transparent',
      topOverlay: 'transparent'
    },
    'ensureLockScreenUi'
  )

  await hideSplashScreen()
}
