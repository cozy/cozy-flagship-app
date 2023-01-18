import Minilog from '@cozy/minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('useAppBootstrap.functions')

interface OnboardingParams {
  onboardUrl: string | null
  fqdn: string | null
}

export const parseOnboardingURL = (
  url: string | null
): OnboardingParams | undefined => {
  try {
    if (!url?.includes('onboarding')) {
      return undefined
    }

    const onboardingUrl = new URL(url)
    const onboardUrl = onboardingUrl.searchParams.get('onboard_url')
    const fqdn = onboardingUrl.searchParams.get('fqdn')

    if (!onboardUrl && !fqdn) {
      return undefined
    }

    return {
      onboardUrl,
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
    const fallback = makeURL.searchParams.get('fallback') ?? undefined
    const isHome = makeURL.pathname.split('/')[1] === 'home'

    return {
      mainAppFallbackURL: isHome ? fallback : undefined,
      cozyAppFallbackURL: !isHome ? fallback : undefined
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to parse fallback URL data: ${errorMessage}`
    )
    return defaultParse
  }
}
