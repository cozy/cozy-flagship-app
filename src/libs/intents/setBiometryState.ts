import ReactNativeBiometrics from 'react-native-biometrics'
import { EventEmitter } from 'events'

import { FlagshipMetadata } from 'cozy-device-helper/dist/flagship'

import { getData, StorageKeys, storeData } from '/libs/localStore/storage'
import { promptBiometry } from '/screens/lock/functions/lockScreenFunctions'
import { getVaultInformation } from '../keychain'

export const BiometryEmitter = new EventEmitter()

const BIOMETRY_DENIED_BY_USER_IOS_ERROR = /.*User.*denied.*/

const updateBiometrySetting = async (activated: boolean): Promise<boolean> => {
  await storeData(StorageKeys.BiometryActivated, activated)
  if (!activated && !(await getData(StorageKeys.AutoLockEnabled)))
    await storeData(StorageKeys.AutoLockEnabled, true)
  const newData = Boolean(await getData(StorageKeys.BiometryActivated))

  BiometryEmitter.emit('change', newData)

  return newData
}

const handleBiometryActivation = async (
  biometryEnabled: FlagshipMetadata['settings_biometryEnabled']
): Promise<boolean> => {
  if (biometryEnabled) return updateBiometrySetting(false)

  const { success } = await promptBiometry()

  return success && updateBiometrySetting(true)
}

export const openSettingBiometry = async (): Promise<boolean> => {
  const biometryEnabled = await getData<
    FlagshipMetadata['settings_biometryEnabled']
  >(StorageKeys.BiometryActivated)

  return handleBiometryActivation(Boolean(biometryEnabled))
}

export const isBiometryDenied = async (): Promise<boolean> => {
  const rnBiometrics = new ReactNativeBiometrics()

  const sensorData = await rnBiometrics.isSensorAvailable()
  const biometryDenied = BIOMETRY_DENIED_BY_USER_IOS_ERROR.test(
    sensorData.error ?? ''
  )

  return biometryDenied
}

export const makeFlagshipMetadataInjection = async (): Promise<string> => {
  const rnBiometrics = new ReactNativeBiometrics()

  const sensorData = await rnBiometrics.isSensorAvailable()
  const biometryDenied = BIOMETRY_DENIED_BY_USER_IOS_ERROR.test(
    sensorData.error ?? ''
  )

  const flagshipMetadata: FlagshipMetadata = {
    settings_PINEnabled: Boolean(await getVaultInformation('pinCode')),
    settings_biometryEnabled: Boolean(
      await getData(StorageKeys.BiometryActivated)
    ),
    settings_autoLockEnabled: Boolean(
      await getData(StorageKeys.AutoLockEnabled)
    ),
    biometry_type: sensorData.biometryType,
    biometry_available: sensorData.available,
    biometry_authorisation_denied: biometryDenied
  }

  const flagshipMetadataString = JSON.stringify(flagshipMetadata)

  return `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...${flagshipMetadataString}};
  `
}
