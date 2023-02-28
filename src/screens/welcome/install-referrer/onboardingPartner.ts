import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import Minilog from '@cozy/minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { getInstallReferrer } from '/screens/welcome/install-referrer/androidPlayInstallReferrer'

import strings from '/constants/strings.json'

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

const noOnboardingPartner = (): NoOnboardingPartner => ({ hasReferral: false })

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

const saveOnboardingPartnerOnAsyncStorage = async (
  onboardingPartner: OnboardingPartner
): Promise<void> => {
  const serializedOnboardingPartner = JSON.stringify(onboardingPartner)
  log.debug(
    `saving onboardingPartner=${serializedOnboardingPartner} into AsyncStorage`
  )
  await AsyncStorage.setItem(
    strings.ONBOARDING_PARTNER_STORAGE_KEY,
    serializedOnboardingPartner
  )
}

const getOnboardingPartnerFromAsyncStorage =
  async (): Promise<OnboardingPartner | null> => {
    log.debug('get onboardingPartner from AsyncStorage')

    try {
      const onboardingPartnerString = await AsyncStorage.getItem(
        strings.ONBOARDING_PARTNER_STORAGE_KEY
      )
      log.debug(
        `got onboardingPartner=${
          onboardingPartnerString ?? ''
        } from AsyncStorage`
      )

      const onboardingPartner = onboardingPartnerString
        ? (JSON.parse(onboardingPartnerString) as OnboardingPartner)
        : null

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
