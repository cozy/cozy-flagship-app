import { Alert, Platform } from 'react-native'

import { extractEnvFromUrl } from './useCozyEnvironmentOverride.functions'

import {
  DevicePersistedStorageKeys,
  getData,
  storeData,
  removeData
} from '/libs/localStore/storage'

jest.spyOn(Alert, 'alert')
jest.mock(
  '/screens/welcome/install-referrer/androidPlayInstallReferrer',
  () => ({
    getInstallReferrer: jest.fn()
  })
)

describe('extractEnvFromUrl', () => {
  beforeEach(async () => {
    await removeData(DevicePersistedStorageKeys.OnboardingPartner)
    await removeData(DevicePersistedStorageKeys.ClouderyEnv)
    Platform.OS = 'android'
  })

  it('should intercept cloudery_environment=PROD', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=PROD'
    )

    expect(await getData(DevicePersistedStorageKeys.ClouderyEnv)).toBe('PROD')
  })

  it('should intercept cloudery_environment=DEV', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=DEV'
    )

    expect(await getData(DevicePersistedStorageKeys.ClouderyEnv)).toBe('DEV')
  })

  it('should intercept cloudery_environment=INT', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=INT'
    )

    expect(await getData(DevicePersistedStorageKeys.ClouderyEnv)).toBe('INT')
  })

  it('should ignore unexpected cloudery_environment values', async () => {
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'DEV')

    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=SOME_BAD_ENV'
    )

    expect(await getData(DevicePersistedStorageKeys.ClouderyEnv)).toBe('DEV')
  })

  it('should intercept clear_partner instruction', async () => {
    await storeData(DevicePersistedStorageKeys.OnboardingPartner, {
      source: 'SOME_SOURCE',
      context: 'SOME_CONTEXT',
      hasReferral: true
    })

    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?clear_partner=true'
    )

    expect(await getData(DevicePersistedStorageKeys.OnboardingPartner)).toEqual(
      {
        hasReferral: false
      }
    )
  })

  it('should intercept partner_source and partner_context', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT'
    )

    expect(await getData(DevicePersistedStorageKeys.OnboardingPartner)).toEqual(
      {
        source: 'SOME_PARTNER',
        context: 'SOME_CONTEXT',
        hasReferral: true
      }
    )
  })

  it('should not intercept partner if partner_source is null', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_context=SOME_CONTEXT'
    )

    expect(
      await getData(DevicePersistedStorageKeys.OnboardingPartner)
    ).toBeNull()
  })

  it('should not intercept partner if partner_context is null', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER'
    )

    expect(
      await getData(DevicePersistedStorageKeys.OnboardingPartner)
    ).toBeNull()
  })

  it('should not intercept partner on iOS', async () => {
    Platform.OS = 'ios'
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT'
    )

    expect(
      await getData(DevicePersistedStorageKeys.OnboardingPartner)
    ).toBeNull()
  })

  it('should handle both partner and cloudery_environment params', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT&cloudery_environment=DEV'
    )

    expect(await getData(DevicePersistedStorageKeys.OnboardingPartner)).toEqual(
      {
        source: 'SOME_PARTNER',
        context: 'SOME_CONTEXT',
        hasReferral: true
      }
    )
    expect(await getData(DevicePersistedStorageKeys.ClouderyEnv)).toBe('DEV')
  })

  it('should alert the user about changes', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT&cloudery_environment=DEV'
    )

    expect(Alert.alert).toHaveBeenCalledWith(
      'Environment',
      'Environment has been overriden\n\nPartner: SOME_PARTNER / SOME_CONTEXT\nCloudery: twake - DEV',
      undefined,
      { cancelable: true }
    )
  })

  it('should alert the user about changes with no partner', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=DEV'
    )

    expect(Alert.alert).toHaveBeenCalledWith(
      'Environment',
      'Environment has been overriden\n\nPartner: (none)\nCloudery: twake - DEV',
      undefined,
      { cancelable: true }
    )
  })

  it('should not alert the user if no changes', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override'
    )

    expect(Alert.alert).not.toHaveBeenCalled()
  })
})
