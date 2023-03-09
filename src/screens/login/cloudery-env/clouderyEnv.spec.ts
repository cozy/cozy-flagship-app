import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import { getClouderyUrl } from '/screens/login/cloudery-env/clouderyEnv'
import strings from '/constants/strings.json'

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

  it(`should return Android's PROD url`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'PROD')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.prodBaseUri +
        strings.cloudery.cozyRelativeUri +
        '?' +
        strings.cloudery.androidQueryString
    )
  })

  it(`should return Android's DEV url`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'DEV')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.devBaseUri +
        strings.cloudery.cozyRelativeUri +
        '?' +
        strings.cloudery.androidQueryString
    )
  })

  it(`should return Android's INT url`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'INT')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.intBaseUri +
        strings.cloudery.cozyRelativeUri +
        '?' +
        strings.cloudery.androidQueryString
    )
  })

  it(`should return iOS's INT url`, async () => {
    Platform.OS = 'ios'
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'INT')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.intBaseUri +
        strings.cloudery.cozyRelativeUri +
        '?' +
        strings.cloudery.iOSQueryString
    )
  })

  it(`should return PROD url if nothing in AsyncStorage`, async () => {
    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.prodBaseUri +
        strings.cloudery.cozyRelativeUri +
        '?' +
        strings.cloudery.androidQueryString
    )
  })

  it(`should return PROD url if BAD_FORMAT in AsyncStorage`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'BAD_FORMAT')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.prodBaseUri +
        strings.cloudery.cozyRelativeUri +
        '?' +
        strings.cloudery.androidQueryString
    )
  })

  it(`should return OnboardingPartner url if detected`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'PROD')
    await AsyncStorage.setItem(
      strings.ONBOARDING_PARTNER_STORAGE_KEY,
      '{"source":"SOME_SOURCE","context":"SOME_CONTEXT","hasReferral":true}'
    )

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.prodBaseUri +
        '/v2/SOME_SOURCE/SOME_CONTEXT?' +
        strings.cloudery.androidQueryString
    )
  })

  it(`should return Cozy url if no OnboardingPartner is detected`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'PROD')
    await AsyncStorage.setItem(
      strings.ONBOARDING_PARTNER_STORAGE_KEY,
      '{"hasReferral":false}'
    )

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.cloudery.prodBaseUri +
        strings.cloudery.cozyRelativeUri +
        '?' +
        strings.cloudery.androidQueryString
    )
  })
})
