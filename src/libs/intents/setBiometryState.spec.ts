import { StorageKeys, storeData } from '/libs/localStore/storage'
import {
  isBiometryDenied,
  makeFlagshipMetadataInjection
} from '/libs/intents/setBiometryState'

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
