import Minilog from 'cozy-minilog'

import { BootstrapAction } from '/app/domain/bootsrap/model/BootstrapAction'
import { FallbackUrl } from '/app/domain/deeplinks/models/FallbackUrl'
import { MagicLinkUrl } from '/app/domain/deeplinks/models/MagicLinkUrl'
import { OnboardingParams } from '/app/domain/deeplinks/models/OnboardingParams'
import { routes } from '/constants/routes'
import strings from '/constants/strings.json'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('DeeplinksParserService')

const MAIN_APP = 'home'
const FALLBACK_PARAM = 'fallback'
const UNIVERSAL_LINK_BASE_PATH = 'flagship'

/**
 * Parse the given deeplink (universal link or app scheme) and extract the Manager URL if any
 */
const parseManagerURL = (url: string | null): string | undefined => {
  try {
    if (!url?.includes('manager?fallback')) {
      return undefined
    }

    const universalLink = new URL(url)
    const managerUrl = universalLink.searchParams.get('fallback')

    if (!managerUrl) {
      return undefined
    }

    return managerUrl
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to parse manager URL data: ${errorMessage}`
    )
    return undefined
  }
}

/**
 * Parse the given deeplink (universal link or app scheme) and extract the Onboarding data if any
 */
export const parseOnboardingURL = (
  url: string | null
): OnboardingParams | undefined => {
  try {
    if (
      !url?.includes('onboarding') ||
      url.includes('oidc_result') ||
      url.includes('magic_code')
    ) {
      return undefined
    }

    const onboardingUrl = new URL(url)
    const onboardUrl = onboardingUrl.searchParams.get('onboard_url')
    const onboardedRedirection = onboardingUrl.searchParams.get(
      'onboarded_redirection'
    )
    const fqdn = onboardingUrl.searchParams.get('fqdn')
    const emailVerifiedCode = onboardingUrl.searchParams.get(
      'email_verified_code'
    )

    if (!onboardUrl && !fqdn) {
      return undefined
    }

    return {
      emailVerifiedCode,
      fqdn,
      onboardUrl,
      onboardedRedirection
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to parse onboarding URL data: ${errorMessage}`
    )
    return undefined
  }
}

/**
 * Parse the given deeplink (universal link or app scheme) and extract the fallback data if any
 * (used to redirect the app to cozy-home specific path or to a cozy-app)
 */
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
    let fallback = makeURL.searchParams.get(FALLBACK_PARAM) ?? undefined

    if (
      fallback?.startsWith(strings.COZY_SCHEME) ||
      fallback?.startsWith(strings.cloudery.prodBaseUri) ||
      fallback?.startsWith(strings.cloudery.intBaseUri) ||
      fallback?.startsWith(strings.cloudery.devBaseUri)
    ) {
      fallback = undefined
    }

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

/**
 * Parse the given deeplink (universal link or app scheme) and extract the MagicLink data if any
 */
export const parseMagicLinkURL = (url: string | null): MagicLinkUrl | null => {
  if (url === null) {
    return null
  }

  try {
    const makeURL = new URL(url)
    const fqdn = makeURL.searchParams.get('fqdn')
    const magicCode = makeURL.searchParams.get('magic_code')

    if (!fqdn || !magicCode) {
      return null
    }

    return {
      fqdn,
      magicCode
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to parse magic link URL data: ${errorMessage}`
    )
    return null
  }
}

/**
 * Parse the given deeplink (universal link or app scheme) and return the
 * expected screen to be displayed (with route params)
 */
export const parseOnboardLink = (
  deeplink: string | null
): BootstrapAction | null => {
  if (deeplink === null) {
    return null
  }

  const managerUrl = parseManagerURL(deeplink)

  if (managerUrl) {
    return {
      route: routes.manager,
      params: {
        managerUrl
      }
    }
  }

  const onboardingParams = parseOnboardingURL(deeplink)

  if (onboardingParams) {
    const {
      onboardUrl,
      onboardedRedirection: onboardedRedirectionParam,
      fqdn,
      emailVerifiedCode
    } = onboardingParams

    if (onboardUrl) {
      log.debug(`Deeplink is instanceCreation for ${onboardUrl}`)
      return {
        route: routes.instanceCreation,
        params: {
          onboardUrl
        },
        onboardedRedirection: onboardedRedirectionParam
      }
    } else if (fqdn) {
      log.debug(`Deeplink is authenticate for ${fqdn}`)
      return {
        route: routes.authenticate,
        params: {
          fqdn,
          emailVerifiedCode
        },
        onboardedRedirection: onboardedRedirectionParam
      }
    }
  }

  const magicLink = parseMagicLinkURL(deeplink)

  if (magicLink) {
    const { fqdn, magicCode } = magicLink

    log.debug(`Deeplink is authenticate with magic code for ${fqdn}`)
    return {
      route: routes.authenticate,
      params: { fqdn, magicCode }
    }
  }

  return null
}
