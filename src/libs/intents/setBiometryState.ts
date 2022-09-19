import { Alert } from 'react-native'
import { EventEmitter } from 'events'

import Minilog from '@cozy/minilog'

import { getData, StorageKeys, storeData } from '../localStore/storage'
import { FlagshipMetadata } from 'cozy-device-helper/dist/flagship'

const log = Minilog('setBiometryState.ts')

export const BiometryEmitter = new EventEmitter()

const updateBiometrySetting = async (activated: boolean): Promise<boolean> => {
  await storeData(StorageKeys.BiometryActivated, activated)
  const newData = Boolean(await getData(StorageKeys.BiometryActivated))

  BiometryEmitter.emit('change', newData)

  return newData
}

export const openSettingBiometry = (): Promise<boolean> => {
  return new Promise<boolean>(resolve => {
    Alert.alert(
      'Biometry Activation',
      'Do you wish to activate biometric features?',
      [
        {
          text: 'No',
          onPress: (): void => {
            updateBiometrySetting(false)
              .then(v => resolve(v))
              .catch(e => {
                log.error(e)
                resolve(false)
              })
          }
        },
        {
          text: 'Yes',
          onPress: (): void => {
            updateBiometrySetting(true)
              .then(v => resolve(v))
              .catch(e => {
                log.error(e)
                resolve(true)
              })
          }
        }
      ]
    )
  })
}

export const makeBiometryInjection = async (): Promise<string> => {
  const settings: FlagshipMetadata['settings'] = {
    biometryEnabled: Boolean(await getData(StorageKeys.BiometryActivated)),
    autoLockEnabled: Boolean(await getData(StorageKeys.AutoLockEnabled))
  }

  return `window.cozy.flagship.settings = ${JSON.stringify(settings)};`
}
