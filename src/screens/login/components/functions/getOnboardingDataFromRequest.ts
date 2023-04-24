import { WebViewNavigation } from 'react-native-webview'

import strings from '/constants/strings.json'

interface OnboardingData {
  fqdn: string
  registerToken: string | null
  magicCode: string | null
  onboardedRedirection: string | null
}

const getInstanceAndRegisterToken = (uri: string): OnboardingData | null => {
  const url = new URL(window.decodeURIComponent(uri))

  const isOnboarding = url.searchParams.get('onboarding')

  if (!isOnboarding) {
    return null
  }

  const registerToken = url.searchParams.get(strings.registerToken)
  const onboardedRedirection = url.searchParams.get('redirection')
  const magicCode = url.searchParams.get('magic_code')

  const fqdn = url.host

  return {
    fqdn,
    registerToken,
    magicCode,
    onboardedRedirection
  }
}

export const getOnboardingDataFromRequest = (
  request: WebViewNavigation
): OnboardingData | null => {
  const navigationUrl = request.url

  if (!navigationUrl) {
    return null
  }

  return getInstanceAndRegisterToken(navigationUrl)
}
