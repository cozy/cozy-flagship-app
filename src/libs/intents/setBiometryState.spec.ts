import { StorageKeys, storeData } from '/libs/localStore/storage'
import { makeFlagshipMetadataInjection } from '/libs/intents/setBiometryState'

jest.mock('react-native-biometrics', () => {
  class ReactNativeBiometrics {
    isSensorAvailable = jest.fn().mockResolvedValue({
      biometryType: 'FaceID',
      available: true
    })
  }

  return ReactNativeBiometrics
})

it('should not throw with a null hasBiometry', async () => {
  const result = await makeFlagshipMetadataInjection()
  expect(result).toStrictEqual(
    `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_biometryEnabled":false,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true}};
  `
  )
})

it('should handle true value', async () => {
  await storeData(StorageKeys.BiometryActivated, true)
  const result = await makeFlagshipMetadataInjection()
  expect(result).toStrictEqual(
    `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_biometryEnabled":true,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true}};
  `
  )
})

it('should handle truthy value', async () => {
  await storeData(StorageKeys.BiometryActivated, 'true')
  const result = await makeFlagshipMetadataInjection()
  expect(result).toStrictEqual(
    `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_biometryEnabled":true,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true}};
  `
  )
})

it('should handle false value', async () => {
  await storeData(StorageKeys.BiometryActivated, false)
  const result = await makeFlagshipMetadataInjection()
  expect(result).toStrictEqual(
    `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_biometryEnabled":false,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true}};
  `
  )
})

it('should handle falsy value', async () => {
  await storeData(StorageKeys.BiometryActivated, '')
  const result = await makeFlagshipMetadataInjection()
  expect(result).toStrictEqual(
    `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_biometryEnabled":false,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true}};
  `
  )
})
