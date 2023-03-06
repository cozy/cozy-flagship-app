import Minilog from '@cozy/minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('useAppBootstrap.functions')

interface OnboardingParams {
  onboardUrl: string | null
  onboardedRedirection: string | null
  fqdn: string | null
}

const MAIN_APP = 'home'
const FALLBACK_PARAM = 'fallback'
const UNIVERSAL_LINK_BASE_PATH = 'flagship'

export const parseOnboardingURL = (
  url: string | null
): OnboardingParams | undefined => {
  try {
    if (!url?.includes('onboarding')) {
      return undefined
    }

    const onboardingUrl = new URL(url)
    const onboardUrl = onboardingUrl.searchParams.get('onboard_url')
    const onboardedRedirection = onboardingUrl.searchParams.get(
      'onboarded_redirection'
    )
    const fqdn = onboardingUrl.searchParams.get('fqdn')

    if (!onboardUrl && !fqdn) {
      return undefined
    }

    return {
      onboardUrl,
      onboardedRedirection,
      fqdn
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to parse onboarding URL data: ${errorMessage}`
    )
    return undefined
  }
}

interface FallbackUrl {
  mainAppFallbackURL: string | undefined
  cozyAppFallbackURL: string | undefined
}

export const parseFallbackURL = (url: string | null): FallbackUrl => {
  const defaultParse = {
    mainAppFallbackURL: undefined,
    cozyAppFallbackURL: undefined
  }

  if (url === null) {
    return defaultParse
  }

  try {
    const makeURL = new URL(url)
    const fallback = makeURL.searchParams.get(FALLBACK_PARAM) ?? undefined
    const isMainApp =
      makeURL.pathname.startsWith(`/${MAIN_APP}`) ||
      makeURL.pathname.startsWith(`/${UNIVERSAL_LINK_BASE_PATH}/${MAIN_APP}`) ||
      makeURL.host === `${MAIN_APP}`

    return {
      mainAppFallbackURL: isMainApp ? fallback : undefined,
      cozyAppFallbackURL: !isMainApp ? fallback : undefined
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to parse fallback URL data: ${errorMessage}`
    )
    return defaultParse
  }
}
