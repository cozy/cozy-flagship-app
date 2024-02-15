import { Platform } from 'react-native'

import {
  DevicePersistedStorageKeys,
  getData,
  storeData,
  clearAllData
} from '/libs/localStore/storage'

import { getInstallReferrer } from './androidPlayInstallReferrer'
import { getOnboardingPartner } from './onboardingPartner'

jest.mock('/libs/localStore/storage')

jest.mock('./androidPlayInstallReferrer', () => ({
  getInstallReferrer: jest.fn()
}))

describe('onboardingPartner', () => {
  beforeEach(() => {
    clearAllData()
    jest.clearAllMocks()
    Platform.OS = 'android'
  })

  it(`should retrieve onboarding partner from "onboarding_partner" campaign links`, async () => {
    getInstallReferrer.mockResolvedValue({
      installReferrer:
        'utm_source=SOME_SOURCE&utm_content=SOME_CONTEXT&utm_campaign=onboarding_partner&anid=admob'
    })

    const onboardingPartner = await getOnboardingPartner()

    expect(onboardingPartner).toStrictEqual({
      source: 'SOME_SOURCE',
      context: 'SOME_CONTEXT',
      hasReferral: true
    })
    expect(storeData).toHaveBeenCalledWith(
      DevicePersistedStorageKeys.OnboardingPartner,
      { source: 'SOME_SOURCE', context: 'SOME_CONTEXT', hasReferral: true }
    )
  })

  it(`should retrieve NO_ONBOARDING_PARTNER from non "onboarding_partner" campaigns`, async () => {
    getInstallReferrer.mockResolvedValue({
      installReferrer:
        'utm_source=SOME_SOURCE&utm_content=SOME_CONTEXT&utm_campaign=ANOTHER_CAMPAIGN&anid=admob'
    })

    const onboardingPartner = await getOnboardingPartner()

    expect(onboardingPartner.hasReferral).toBe(false)
    expect(storeData).toHaveBeenCalledWith(
      DevicePersistedStorageKeys.OnboardingPartner,
      { hasReferral: false }
    )
  })

  it(`should retrieve NO_ONBOARDING_PARTNER from classic install`, async () => {
    getInstallReferrer.mockResolvedValue({
      installReferrer: 'utm_source=google-play&utm_medium=organic'
    })

    const onboardingPartner = await getOnboardingPartner()

    expect(onboardingPartner.hasReferral).toBe(false)
    expect(storeData).toHaveBeenCalledWith(
      DevicePersistedStorageKeys.OnboardingPartner,
      { hasReferral: false }
    )
  })

  it(`should retrieve NO_ONBOARDING_PARTNER if getInstallReferrer return null (in case of error)`, async () => {
    getInstallReferrer.mockResolvedValue(null)

    const onboardingPartner = await getOnboardingPartner()

    expect(onboardingPartner.hasReferral).toBe(false)
    expect(storeData).toHaveBeenCalledWith(
      DevicePersistedStorageKeys.OnboardingPartner,
      { hasReferral: false }
    )
  })

  it(`should retrieve onboarding partner from AsyncStorage if any`, async () => {
    getData.mockResolvedValue({
      source: 'SOME_PARTNER',
      context: 'SOME_CONTEXT'
    })
    getInstallReferrer.mockResolvedValue({
      installReferrer: 'utm_source=google-play&utm_medium=organic'
    })

    const onboardingPartner = await getOnboardingPartner()

    expect(getInstallReferrer).not.toHaveBeenCalled()
    expect(onboardingPartner.source).toBe('SOME_PARTNER')
    expect(onboardingPartner.context).toBe('SOME_CONTEXT')
    expect(storeData).not.toHaveBeenCalled()
  })

  it(`should handle AsyncStorage with null`, async () => {
    getData.mockResolvedValue(null)
    getInstallReferrer.mockResolvedValue({
      installReferrer: 'utm_source=google-play&utm_medium=organic'
    })

    const onboardingPartner = await getOnboardingPartner()

    expect(getData).toHaveBeenCalled()
    expect(getInstallReferrer).toHaveBeenCalled()
    expect(onboardingPartner.hasReferral).toBe(false)
    expect(storeData).toHaveBeenCalledWith(
      DevicePersistedStorageKeys.OnboardingPartner,
      { hasReferral: false }
    )
  })

  it(`should return NO_ONBOARDING_PARTNER on iOS`, async () => {
    Platform.OS = 'ios'
    getData.mockResolvedValue('SOME_PARTNER')
    getInstallReferrer.mockResolvedValue({
      installReferrer: 'utm_source=google-play&utm_medium=organic'
    })

    const onboardingPartner = await getOnboardingPartner()

    expect(getInstallReferrer).not.toHaveBeenCalled()
    expect(getData).not.toHaveBeenCalled()
    expect(storeData).not.toHaveBeenCalled()
    expect(onboardingPartner.hasReferral).toBe(false)
  })
})
