import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import { getOnboardingPartner } from '/screens/welcome/install-referrer/onboardingPartner'
import strings from '/constants/strings.json'

const ALL_CLOUDERY_ENV = ['DEV', 'INT', 'PROD'] as const
const CLOUDERY_DEFAULT_ENV = 'PROD'
type ClouderyEnvTuple = typeof ALL_CLOUDERY_ENV
export type ClouderyEnv = ClouderyEnvTuple[number]

interface PartnerClouderyUrls {
  loginUrl: string
  isOnboardingPartner: true
}
interface CozyClouderyUrls {
  loginUrl: string
  signinUrl: string
  isOnboardingPartner: false
}

export type ClouderyUrls = CozyClouderyUrls | PartnerClouderyUrls

export const isClouderyEnv = (value: string): value is ClouderyEnv => {
  return ALL_CLOUDERY_ENV.includes(value as ClouderyEnv)
}

export const saveClouderyEnvOnAsyncStorage = (
  environment: ClouderyEnv
): Promise<void> => {
  return AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, environment)
}

export const getClouderyEnvFromAsyncStorage =
  async (): Promise<ClouderyEnv> => {
    const clouderyEnv = await AsyncStorage.getItem(
      strings.CLOUDERY_ENV_STORAGE_KEY
    )

    if (!clouderyEnv || !isClouderyEnv(clouderyEnv)) {
      return CLOUDERY_DEFAULT_ENV
    }

    return clouderyEnv
  }

const getOnboardingPartnerRelativeUrl = async (): Promise<string | null> => {
  const onboardingPartner = await getOnboardingPartner()

  if (!onboardingPartner.hasReferral) {
    return null
  }

  const { source, context } = onboardingPartner
  return `/v2/${source}/${context}`
}

export const getClouderyUrls = async (): Promise<ClouderyUrls> => {
  const clouderyEnv = await getClouderyEnvFromAsyncStorage()

  const baseUris: Record<ClouderyEnv, string> = {
    PROD: strings.cloudery.prodBaseUri,
    INT: strings.cloudery.intBaseUri,
    DEV: strings.cloudery.devBaseUri
  }
  const baseUri = baseUris[clouderyEnv]

  const onboardingPartnerPath = await getOnboardingPartnerRelativeUrl()
  const relativeLoginUri =
    onboardingPartnerPath ?? strings.cloudery.cozyLoginRelativeUri
  const relativeSigninUri = strings.cloudery.cozySigninRelativeUri

  const queryString =
    Platform.OS === 'ios'
      ? strings.cloudery.iOSQueryString
      : strings.cloudery.androidQueryString

  const loginUrl = `${baseUri}${relativeLoginUri}?${queryString}`
  const signinUrl = `${baseUri}${relativeSigninUri}?${queryString}`

  if (onboardingPartnerPath) {
    return {
      isOnboardingPartner: true,
      loginUrl
    }
  }

  return {
    loginUrl,
    signinUrl,
    isOnboardingPartner: false
  }
}
