import {
  CozyPersistedStorageKeys,
  getData,
  storeData,
  clearCozyData
} from '/libs/localStore/storage'
import {
  makeFlagshipMetadataInjection,
  isBiometryDenied,
  BiometryEmitter,
  updateBiometrySetting
} from '/app/domain/authentication/services/BiometryService'

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

jest.mock('react-native-file-viewer', () => ({
  open: jest.fn()
}))

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
  await storeData(CozyPersistedStorageKeys.BiometryActivated, true)
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
  await storeData(CozyPersistedStorageKeys.BiometryActivated, 'true')
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
  await storeData(CozyPersistedStorageKeys.BiometryActivated, false)
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
  await storeData(CozyPersistedStorageKeys.BiometryActivated, '')
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

  beforeEach(async () => await clearCozyData())

  it('should create the biometry and autolock setting with activated argument to true', async () => {
    const expectedValue = true

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    const result = await updateBiometrySetting(expectedValue)
    expect(await getData(CozyPersistedStorageKeys.BiometryActivated)).toBe(
      expectedValue
    )
    expect(await getData(CozyPersistedStorageKeys.AutoLockEnabled)).toBe(
      expectedValue
    )
    expect(result).toBe(expectedValue)
  })

  it('should update the biometry and autolock setting with activated arguments to true', async () => {
    const expectedValue = true

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    await storeData(CozyPersistedStorageKeys.BiometryActivated, !expectedValue)
    await storeData(CozyPersistedStorageKeys.AutoLockEnabled, !expectedValue)

    const result = await updateBiometrySetting(expectedValue)

    expect(await getData(CozyPersistedStorageKeys.BiometryActivated)).toBe(
      expectedValue
    )
    expect(await getData(CozyPersistedStorageKeys.AutoLockEnabled)).toBe(
      expectedValue
    )
    expect(result).toBe(expectedValue)
  })

  it('should update the biometry setting with activated argument to false, not touching existing autolock', async () => {
    const expectedValue = false

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    await storeData(CozyPersistedStorageKeys.AutoLockEnabled, !expectedValue)

    const result = await updateBiometrySetting(expectedValue)

    expect(await getData(CozyPersistedStorageKeys.BiometryActivated)).toBe(
      expectedValue
    )
    expect(await getData(CozyPersistedStorageKeys.AutoLockEnabled)).toBe(
      !expectedValue
    )
    expect(result).toBe(expectedValue)
  })

  it('should update the biometry setting with activated argument to false, not touching non-existing autolock', async () => {
    const expectedValue = false

    BiometryEmitter.once(eventName, value => expect(value).toBe(expectedValue))

    const result = await updateBiometrySetting(expectedValue)

    expect(await getData(CozyPersistedStorageKeys.BiometryActivated)).toBe(
      expectedValue
    )
    expect(await getData(CozyPersistedStorageKeys.AutoLockEnabled)).toBe(
      fsNullValue
    )
    expect(result).toBe(expectedValue)
  })
})
