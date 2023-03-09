import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import { getClouderyUrl } from '/screens/login/cloudery-env/clouderyEnv'
import strings from '/constants/strings.json'

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
      strings.clouderyProdBaseUri + strings.clouderyAndroidRelativeUri
    )
  })

  it(`should return Android's DEV url`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'DEV')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.clouderyDevBaseUri + strings.clouderyAndroidRelativeUri
    )
  })

  it(`should return Android's INT url`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'INT')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.clouderyIntBaseUri + strings.clouderyAndroidRelativeUri
    )
  })

  it(`should return iOS's INT url`, async () => {
    Platform.OS = 'ios'
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'INT')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.clouderyIntBaseUri + strings.clouderyiOSRelativeUri
    )
  })

  it(`should return PROD url if nothing in AsyncStorage`, async () => {
    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.clouderyProdBaseUri + strings.clouderyAndroidRelativeUri
    )
  })

  it(`should return PROD url if BAD_FORMAT in AsyncStorage`, async () => {
    await AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, 'BAD_FORMAT')

    const result = await getClouderyUrl()

    expect(result).toBe(
      strings.clouderyProdBaseUri + strings.clouderyAndroidRelativeUri
    )
  })
})
