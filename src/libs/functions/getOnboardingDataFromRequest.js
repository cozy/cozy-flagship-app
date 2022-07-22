import { validateRequest } from './getUriFromRequest'

import strings from '../../strings.json'

const getInstanceAndRegisterToken = uri => {
  const url = new URL(window.decodeURIComponent(uri))

  const registerToken = url.searchParams.get(strings.registerToken)

  const fqdn = url.host

  return {
    fqdn,
    registerToken
  }
}

export const getOnboardingDataFromRequest = request =>
  getInstanceAndRegisterToken(validateRequest(request))
