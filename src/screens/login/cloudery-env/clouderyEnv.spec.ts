import { Platform } from 'react-native'

import {
  DevicePersistedStorageKeys,
  storeData,
  removeData
} from '/libs/localStore/storage'
import { getClouderyUrls } from '/screens/login/cloudery-env/clouderyEnv'
import strings from '/constants/strings.json'

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

  it(`should return Android's PROD url`, async () => {
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'PROD')

    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozyLoginRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      signinUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozySigninRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      isOnboardingPartner: false
    })
  })

  it(`should return Android's DEV url`, async () => {
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'DEV')

    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.devBaseUri +
        strings.cloudery.cozyLoginRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      signinUrl:
        strings.cloudery.devBaseUri +
        strings.cloudery.cozySigninRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      isOnboardingPartner: false
    })
  })

  it(`should return Android's INT url`, async () => {
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'INT')

    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.intBaseUri +
        strings.cloudery.cozyLoginRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      signinUrl:
        strings.cloudery.intBaseUri +
        strings.cloudery.cozySigninRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      isOnboardingPartner: false
    })
  })

  it(`should return iOS's INT url`, async () => {
    Platform.OS = 'ios'
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'INT')

    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.intBaseUri +
        strings.cloudery.cozyLoginRelativeUri +
        '?' +
        strings.cloudery.iOSQueryString,
      signinUrl:
        strings.cloudery.intBaseUri +
        strings.cloudery.cozySigninRelativeUri +
        '?' +
        strings.cloudery.iOSQueryString,
      isOnboardingPartner: false
    })
  })

  it(`should return PROD url if nothing in AsyncStorage`, async () => {
    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozyLoginRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      signinUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozySigninRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      isOnboardingPartner: false
    })
  })

  it(`should return PROD url if BAD_FORMAT in AsyncStorage`, async () => {
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'BAD_FORMAT')

    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozyLoginRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      signinUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozySigninRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      isOnboardingPartner: false
    })
  })

  it(`should return OnboardingPartner url if detected`, async () => {
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'PROD')
    await storeData(DevicePersistedStorageKeys.OnboardingPartner, {
      source: 'SOME_SOURCE',
      context: 'SOME_CONTEXT',
      hasReferral: true
    })

    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.prodBaseUri +
        '/v2/SOME_SOURCE/SOME_CONTEXT?' +
        strings.cloudery.androidQueryString,
      isOnboardingPartner: true
    })
  })

  it(`should return Cozy url if no OnboardingPartner is detected`, async () => {
    await storeData(DevicePersistedStorageKeys.ClouderyEnv, 'PROD')
    await storeData(DevicePersistedStorageKeys.OnboardingPartner, {
      hasReferral: false
    })

    const result = await getClouderyUrls()

    expect(result).toStrictEqual({
      loginUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozyLoginRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      signinUrl:
        strings.cloudery.prodBaseUri +
        strings.cloudery.cozySigninRelativeUri +
        '?' +
        strings.cloudery.androidQueryString,
      isOnboardingPartner: false
    })
  })
})
