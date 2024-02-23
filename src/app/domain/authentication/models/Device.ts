import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics'
import { isPinOrFingerprintSet } from 'react-native-device-info'

import { getData, CozyPersistedStorageKeys } from '/libs/localStore/storage'

export interface IsSensorAvailableResult {
  available: boolean
  biometryType?: BiometryType
  error?: string
}

const reactNativeBiometrics = new ReactNativeBiometrics()

export const isDeviceSecured = async (): Promise<boolean> => {
  return isPinOrFingerprintSet()
}

export const getBiometricType = async (): Promise<IsSensorAvailableResult> => {
  return await reactNativeBiometrics.isSensorAvailable()
}

export const isAutoLockEnabled = async (): Promise<boolean> => {
  return Boolean(await getData(CozyPersistedStorageKeys.AutoLockEnabled))
}
