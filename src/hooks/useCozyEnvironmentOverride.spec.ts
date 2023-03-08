import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert, Platform } from 'react-native'

import { extractEnvFromUrl } from './useCozyEnvironmentOverride.functions'

import strings from '/constants/strings.json'

jest.spyOn(Alert, 'alert')
jest.mock(
  '/screens/welcome/install-referrer/androidPlayInstallReferrer',
  () => ({
    getInstallReferrer: jest.fn()
  })
)

describe('extractEnvFromUrl', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem(strings.ONBOARDING_PARTNER_STORAGE_KEY)
    await AsyncStorage.removeItem(strings.CLOUDERY_ENV_STORAGE_KEY)
    Platform.OS = 'android'
  })

  it('should intercept cloudery_environment=PROD', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=PROD'
    )

    expect(await AsyncStorage.getItem(strings.CLOUDERY_ENV_STORAGE_KEY)).toBe(
      'PROD'
    )
  })

  it('should intercept cloudery_environment=DEV', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=DEV'
    )

    expect(await AsyncStorage.getItem(strings.CLOUDERY_ENV_STORAGE_KEY)).toBe(
      'DEV'
    )
  })

  it('should intercept cloudery_environment=INT', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=INT'
    )

    expect(await AsyncStorage.getItem(strings.CLOUDERY_ENV_STORAGE_KEY)).toBe(
      'INT'
    )
  })

  it('should ignore unexpected cloudery_environment values', async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'DEV')

    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?cloudery_environment=SOME_BAD_ENV'
    )

    expect(await AsyncStorage.getItem(strings.CLOUDERY_ENV_STORAGE_KEY)).toBe(
      'DEV'
    )
  })

  it('should intercept clear_partner instruction', async () => {
    await AsyncStorage.setItem(
      strings.ONBOARDING_PARTNER_STORAGE_KEY,
      '{"source":"SOME_SOURCE","context":"SOME_CONTEXT","hasReferral":true}'
    )

    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?clear_partner=true'
    )

    expect(
      await AsyncStorage.getItem(strings.ONBOARDING_PARTNER_STORAGE_KEY)
    ).toBe('{"hasReferral":false}')
  })

  it('should intercept partner_source and partner_context', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT'
    )

    expect(
      await AsyncStorage.getItem(strings.ONBOARDING_PARTNER_STORAGE_KEY)
    ).toBe(
      '{"source":"SOME_PARTNER","context":"SOME_CONTEXT","hasReferral":true}'
    )
  })

  it('should not intercept partner if partner_source is null', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_context=SOME_CONTEXT'
    )

    expect(
      await AsyncStorage.getItem(strings.ONBOARDING_PARTNER_STORAGE_KEY)
    ).toBeNull()
  })

  it('should not intercept partner if partner_context is null', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER'
    )

    expect(
      await AsyncStorage.getItem(strings.ONBOARDING_PARTNER_STORAGE_KEY)
    ).toBeNull()
  })

  it('should not intercept partner on iOS', async () => {
    Platform.OS = 'ios'
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT'
    )

    expect(
      await AsyncStorage.getItem(strings.ONBOARDING_PARTNER_STORAGE_KEY)
    ).toBeNull()
  })

  it('should handle both partner and cloudery_environment params', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT&cloudery_environment=DEV'
    )

    expect(
      await AsyncStorage.getItem(strings.ONBOARDING_PARTNER_STORAGE_KEY)
    ).toBe(
      '{"source":"SOME_PARTNER","context":"SOME_CONTEXT","hasReferral":true}'
    )
    expect(await AsyncStorage.getItem(strings.CLOUDERY_ENV_STORAGE_KEY)).toBe(
      'DEV'
    )
  })

  it('should alert the user about changes', async () => {
    await extractEnvFromUrl(
      'https://links.mycozy.cloud/flagship/cozy_env_override?partner_source=SOME_PARTNER&partner_context=SOME_CONTEXT&cloudery_environment=DEV'
    )

    expect(Alert.alert).toHaveBeenCalledWith(
      'Environment',
      'Environment has been overriden\n\nPartner: SOME_PARTNER / SOME_CONTEXT\nCloudery: DEV',
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
      'Environment has been overriden\n\nPartner: (none)\nCloudery: DEV',
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
