import ReactNativeBiometrics from 'react-native-biometrics'
import { EventEmitter } from 'events'

import { FlagshipMetadata } from 'cozy-device-helper/dist/flagship'

import { getData, StorageKeys, storeData } from '/libs/localStore/storage'
import { promptBiometry } from '/screens/lock/functions/lockScreenFunctions'

export const BiometryEmitter = new EventEmitter()

const updateBiometrySetting = async (activated: boolean): Promise<boolean> => {
  await storeData(StorageKeys.BiometryActivated, activated)
  await storeData(StorageKeys.AutoLockEnabled, activated)
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

export const makeFlagshipMetadataInjection = async (): Promise<string> => {
  const rnBiometrics = new ReactNativeBiometrics()

  const flagshipMetadata: FlagshipMetadata = {
    settings_biometryEnabled: Boolean(
      await getData(StorageKeys.BiometryActivated)
    ),
    settings_autoLockEnabled: Boolean(
      await getData(StorageKeys.AutoLockEnabled)
    ),
    biometry_type: (await rnBiometrics.isSensorAvailable()).biometryType,
    biometry_available: (await rnBiometrics.isSensorAvailable()).available
  }

  const flagshipMetadataString = JSON.stringify(flagshipMetadata)

  return `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...${flagshipMetadataString}};
  `
}
