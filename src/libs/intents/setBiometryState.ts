import { Alert } from 'react-native'
import { EventEmitter } from 'events'

import { getData, StorageKeys, storeData } from '../localStore/storage'

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
              .catch(e => resolve(e))
          }
        },
        {
          text: 'Yes',
          onPress: (): void => {
            updateBiometrySetting(true)
              .then(v => resolve(v))
              .catch(e => resolve(e))
          }
        }
      ]
    )
  })
}

export const makeBiometryInjection = async (): Promise<string> =>
  `window.cozy.flagship.hasBiometry = ${JSON.stringify(
    Boolean(await getData(StorageKeys.BiometryActivated))
  )};`
