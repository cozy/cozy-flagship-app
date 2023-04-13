import { validateRequest } from './getUriFromRequest'

import strings from '/constants/strings.json'

const getInstanceAndRegisterToken = uri => {
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

export const getOnboardingDataFromRequest = request =>
  getInstanceAndRegisterToken(validateRequest(request))
