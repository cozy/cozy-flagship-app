import { Alert, Platform } from 'react-native'

import {
  getOnboardingPartner,
  noOnboardingPartner,
  OnboardingPartner,
  saveOnboardingPartnerOnAsyncStorage
} from '/screens/welcome/install-referrer/onboardingPartner'
import {
  ClouderyEnv,
  isClouderyEnv,
  getClouderyEnvFromAsyncStorage,
  saveClouderyEnvOnAsyncStorage
} from '/screens/login/cloudery-env/clouderyEnv'

const ENV_OVERRIDE_PATH = 'cozy_env_override' as const

const parseOnboardingPartnerFromUrl = (
  url: string
): OnboardingPartner | null => {
  if (Platform.OS !== 'android') return null

  const partnerUrl = new URL(url)

  const partnerSource = partnerUrl.searchParams.get('partner_source')
  const partnerContext = partnerUrl.searchParams.get('partner_context')
  const clearPartner = partnerUrl.searchParams.get('clear_partner')

  if (clearPartner) {
    return noOnboardingPartner()
  }

  if (!partnerSource || !partnerContext) {
    return null
  }

  return {
    source: partnerSource,
    context: partnerContext,
    hasReferral: true
  }
}

const parseClouderyEnvFromUrl = (url: string): ClouderyEnv | null => {
  const partnerUrl = new URL(url)

  const clouderyEnv = partnerUrl.searchParams.get('cloudery_environment')

  if (!clouderyEnv || !isClouderyEnv(clouderyEnv)) {
    return null
  }

  return clouderyEnv
}

const alertNewEnvironment = async (): Promise<void> => {
  const clouderyEnv = await getClouderyEnvFromAsyncStorage()
  const partner = await getOnboardingPartner()

  const partnerString = partner.hasReferral
    ? `Partner: ${partner.source} / ${partner.context}`
    : 'Partner: (none)'
  const environmentString = `Cloudery: ${clouderyEnv}`

  Alert.alert(
    'Environment',
    `Environment has been overriden\n\n${partnerString}\n${environmentString}`,
    undefined,
    {
      cancelable: true
    }
  )
}

export const extractEnvFromUrl = async (url: string | null): Promise<void> => {
  if (!url?.includes(ENV_OVERRIDE_PATH)) {
    return
  }

  let envHasChanged = false

  const onboardingPartner = parseOnboardingPartnerFromUrl(url)
  if (onboardingPartner) {
    await saveOnboardingPartnerOnAsyncStorage(onboardingPartner)
    envHasChanged = true
  }

  const clouderyEnv = parseClouderyEnvFromUrl(url)
  if (clouderyEnv) {
    await saveClouderyEnvOnAsyncStorage(clouderyEnv)
    envHasChanged = true
  }

  if (envHasChanged) {
    await alertNewEnvironment()
  }
}
