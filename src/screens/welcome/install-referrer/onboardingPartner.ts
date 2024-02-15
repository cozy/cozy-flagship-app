import { Platform } from 'react-native'

import Minilog from 'cozy-minilog'

import {
  DevicePersistedStorageKeys,
  getData,
  storeData
} from '/libs/localStore/storage'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { getInstallReferrer } from '/screens/welcome/install-referrer/androidPlayInstallReferrer'

const log = Minilog('Referral')

const ONBOARDING_PARTNER_CAMPAIGN = 'onboarding_partner'

export const NO_ONBOARDING_PARTNER = 'NO_ONBOARDING_PARTNER'

interface NoOnboardingPartner {
  hasReferral: false
}

interface WithOnboardingPartner {
  source: string
  context: string
  hasReferral: true
}

export type OnboardingPartner = WithOnboardingPartner | NoOnboardingPartner

export const noOnboardingPartner = (): NoOnboardingPartner => ({
  hasReferral: false
})

const extractOnboardingPartner = (
  installReferrer: string
): OnboardingPartner | null => {
  const url = new URL(`https://cozy.io?${installReferrer}`)

  const utmSource = url.searchParams.get('utm_source')
  const utmCampaign = url.searchParams.get('utm_campaign')
  const utmContent = url.searchParams.get('utm_content')

  if (
    utmCampaign === ONBOARDING_PARTNER_CAMPAIGN &&
    utmSource !== null &&
    utmContent !== null
  ) {
    return {
      source: utmSource,
      context: utmContent,
      hasReferral: true
    }
  }

  return null
}

export const saveOnboardingPartnerOnAsyncStorage = async (
  onboardingPartner: OnboardingPartner
): Promise<void> => {
  log.debug(
    `saving onboardingPartner=${JSON.stringify(
      onboardingPartner
    )} into AsyncStorage`
  )
  await storeData(
    DevicePersistedStorageKeys.OnboardingPartner,
    onboardingPartner
  )
}

const getOnboardingPartnerFromAsyncStorage =
  async (): Promise<OnboardingPartner | null> => {
    log.debug('get onboardingPartner from AsyncStorage')

    try {
      const onboardingPartner = await getData<OnboardingPartner>(
        DevicePersistedStorageKeys.OnboardingPartner
      )

      log.debug(
        `got onboardingPartner=${JSON.stringify(
          onboardingPartner
        )} from AsyncStorage`
      )

      return onboardingPartner
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      log.error(
        `Error while reading OnboardingPartner from async storage: ${errorMessage}`
      )
      return null
    }
  }

const getOnboardingPartnerFromPlayStore =
  async (): Promise<OnboardingPartner | null> => {
    const installReferrerInfo = await getInstallReferrer()

    if (!installReferrerInfo) {
      return null
    }

    const onboardingPartner = extractOnboardingPartner(
      installReferrerInfo.installReferrer
    )

    return onboardingPartner
  }

export const getOnboardingPartner = async (): Promise<OnboardingPartner> => {
  if (Platform.OS !== 'android') return noOnboardingPartner()

  const onboardingPartnerFromAsyncStorage =
    await getOnboardingPartnerFromAsyncStorage()

  if (onboardingPartnerFromAsyncStorage) {
    return onboardingPartnerFromAsyncStorage
  }

  const onboardingPartnerFromPlayStore =
    (await getOnboardingPartnerFromPlayStore()) ?? noOnboardingPartner()

  await saveOnboardingPartnerOnAsyncStorage(onboardingPartnerFromPlayStore)

  return onboardingPartnerFromPlayStore
}
