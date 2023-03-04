import { StorageKeys, storeData } from '/libs/localStore/storage'
import {
  BiometryEmitter,
  isBiometryDenied,
  makeFlagshipMetadataInjection,
  updateBiometrySetting
} from '/libs/intents/setBiometryState'

import AsyncStorage from '@react-native-async-storage/async-storage'

const mockIsSensorAvailable = jest.fn().mockResolvedValue({
  biometryType: 'FaceID',
  available: true
})

jest.mock('react-native-biometrics', () => {
  class ReactNativeBiometrics {
    isSensorAvailable = mockIsSensorAvailable
  }

  return ReactNativeBiometrics
})

jest.mock('react-native-keychain')

jest.mock('@react-native-cookies/cookies', () => ({}))

it('should not throw with a null hasBiometry', async () => {
  const result = await makeFlagshipMetadataInjection()
  expect(result).toStrictEqual(
    `
    window.cozy = window.cozy || {}
    window.cozy.flagship = window.cozy.flagship || {}
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_PINEnabled":false,"settings_biometryEnabled":false,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true,"biometry_authorisation_denied":false}};
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
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_PINEnabled":false,"settings_biometryEnabled":true,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true,"biometry_authorisation_denied":false}};
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
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_PINEnabled":false,"settings_biometryEnabled":true,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true,"biometry_authorisation_denied":false}};
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
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_PINEnabled":false,"settings_biometryEnabled":false,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true,"biometry_authorisation_denied":false}};
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
    window.cozy.flagship = {...window.cozy.flagship, ...{"settings_PINEnabled":false,"settings_biometryEnabled":false,"settings_autoLockEnabled":false,"biometry_type":"FaceID","biometry_available":true,"biometry_authorisation_denied":false}};
  `
  )
})

describe('isBiometryDenied', () => {
  it('should return false in Biometry is available and authorized', async () => {
    const result = await isBiometryDenied()

    expect(result).toBe(false)
  })

  it('should handle Biometry denied error', async () => {
    mockIsSensorAvailable.mockResolvedValueOnce({
      available: false,
      error:
        'Error Domain=com.apple.LocalAuthentication Code=-6 "User has denied the use of biometry for this app." UserInfo={NSDebugDescription=User has denied the use of biometry for this app., NSLocalizedDescription=Biometry is not available.}'
    })
    const result = await isBiometryDenied()

    expect(result).toBe(true)
  })

  it('should return false for other errors', async () => {
    mockIsSensorAvailable.mockResolvedValueOnce({
      available: false,
      error:
        'Error Domain=com.apple.LocalAuthentication Code=-6 "SOME_OTHER_ERROR." UserInfo={NSDebugDescription=SOME_OTHER_ERROR., NSLocalizedDescription=Biometry is not available.}'
    })
    const result = await isBiometryDenied()

    expect(result).toBe(false)
  })
})

/**
 * We also verify in each test that the function resolves to the expected value,
 * reflecting the new state of the biometry and autolock (if needed) settings.
 */
describe('updateBiometrySetting', () => {
  const eventName = 'change'
  const fsNullValue = null

  beforeEach(async () => await AsyncStorage.clear())

  it('should create the biometry and autolock setting with activated argument to true', async () => {
    const expectedValue = true

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    const result = await updateBiometrySetting(expectedValue)

    expect(await AsyncStorage.getItem(StorageKeys.BiometryActivated)).toBe(
      expectedValue.toString()
    )
    expect(await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)).toBe(
      expectedValue.toString()
    )
    expect(result).toBe(expectedValue)
  })

  it('should update the biometry and autolock setting with activated arguments to true', async () => {
    const expectedValue = true

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    await AsyncStorage.multiSet([
      [StorageKeys.BiometryActivated, (!expectedValue).toString()],
      [StorageKeys.AutoLockEnabled, (!expectedValue).toString()]
    ])

    const result = await updateBiometrySetting(expectedValue)

    expect(await AsyncStorage.getItem(StorageKeys.BiometryActivated)).toBe(
      expectedValue.toString()
    )
    expect(await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)).toBe(
      expectedValue.toString()
    )
    expect(result).toBe(expectedValue)
  })

  it('should update the biometry setting with activated argument to false, not touching existing autolock', async () => {
    const expectedValue = false

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    await AsyncStorage.setItem(
      StorageKeys.AutoLockEnabled,
      (!expectedValue).toString()
    )

    const result = await updateBiometrySetting(expectedValue)

    expect(await AsyncStorage.getItem(StorageKeys.BiometryActivated)).toBe(
      expectedValue.toString()
    )
    expect(await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)).toBe(
      (!expectedValue).toString()
    )
    expect(result).toBe(expectedValue)
  })

  it('should update the biometry setting with activated argument to false, not touching non-existing autolock', async () => {
    const expectedValue = false

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    const result = await updateBiometrySetting(expectedValue)

    expect(await AsyncStorage.getItem(StorageKeys.BiometryActivated)).toBe(
      expectedValue.toString()
    )
    expect(await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)).toBe(
      fsNullValue
    )
    expect(result).toBe(expectedValue)
  })
})
