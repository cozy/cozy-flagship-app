import Minilog from 'cozy-minilog'

import { Linking, Platform } from 'react-native'
import type { WebViewNavigation } from 'react-native-webview'

import strings from '/constants/strings.json'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { closeInAppBrowser, showInAppBrowser } from '/libs/intents/InAppBrowser'

const log = Minilog('CozyWebView.functions')

const OIDC_PARAM = 'oidc'
const USER_CANCELED = 'USER_CANCELED'
const INVALID_CALLBACK = 'INVALID_CALLBACK'

const OIDC_CALLBACK_URL_PARAM = 'redirect_after_oidc'
const OIDC_CALLBACK_SCHEME_URL = `${strings.COZY_SCHEME}flagship/oidc_result`

export const LOGIN_FLAGSHIP_URL = 'https://loginflagship'

interface OidcLoginCallback {
  code: string
  fqdn: string
  defaultRedirection: string | null
}

interface OidcOnboardingStartCallback {
  code: string
  onboardUrl: string
}

type OidcCallback = OidcLoginCallback | OidcOnboardingStartCallback

export const isOidcOnboardingStartCallback = (
  callback: unknown
): callback is OidcOnboardingStartCallback => {
  return (
    typeof callback === 'object' &&
    callback !== null &&
    'onboardUrl' in callback
  )
}

/**
 * Check if the given NavigationRequest should trigger the OIDC scenario
 */
export const isOidcNavigationRequest = (
  request: WebViewNavigation
): boolean => {
  try {
    const url = new URL(request.url)

    const oidcParam = url.searchParams.get(OIDC_PARAM)
    const isOIDC = oidcParam !== null && oidcParam !== 'false'

    return isOIDC
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to extract OIDC info from ${request.url} URL: ${errorMessage}`
    )
    return false
  }
}

const parseOIDCOnboardingStartUrl = (
  url: string
): OidcOnboardingStartCallback | null => {
  try {
    const oidcUrl = new URL(url)

    const code = oidcUrl.searchParams.get('code')
    const onboardUrl = oidcUrl.searchParams.get('onboard_url')

    if (!code || !onboardUrl) {
      return null
    }

    return { code, onboardUrl }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to extract OIDC onboarding info from ${url} URL: ${errorMessage}`
    )
    return null
  }
}

const parseOIDCLoginUrl = (url: string): OidcLoginCallback | null => {
  try {
    const oidcUrl = new URL(url)

    const code = oidcUrl.searchParams.get('code')
    const fqdn = oidcUrl.searchParams.get('fqdn')
    const defaultRedirection = oidcUrl.searchParams.get('default_redirection')

    if (!code || !fqdn) {
      return null
    }

    return { code, fqdn, defaultRedirection }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to extract OIDC login info from ${url} URL: ${errorMessage}`
    )
    return null
  }
}

const parseOIDCResultUrl = (url: string): OidcCallback | null => {
  return parseOIDCLoginUrl(url) ?? parseOIDCOnboardingStartUrl(url)
}

interface UrlContainer {
  url: string
}

/**
 * Display InAppBrowser to the given OIDC url
 * @param request - NavigationRequest called by the Cloudery to start the OIDC process
 * @returns OIDC result
 */
export const processOIDC = (
  request: WebViewNavigation | UrlContainer,
  useUniversalLinkForCallback = false
): Promise<OidcCallback> => {
  return new Promise((resolve, reject) => {
    const oidcUrl = new URL(request.url)
    let redirect = ''
    if (useUniversalLinkForCallback) {
      if (Platform.OS === 'android') {
        redirect = strings.UNIVERSAL_LINK_BASE
      } else {
        redirect = strings.COZY_SCHEME
      }
    } else {
      redirect = OIDC_CALLBACK_SCHEME_URL
    }
    oidcUrl.searchParams.append(OIDC_CALLBACK_URL_PARAM, redirect)

    void showInAppBrowser({ url: oidcUrl.toString() }).then(result => {
      if (result.type === 'cancel') {
        reject(USER_CANCELED)
      }
      return
    })

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const oidcResult = parseOIDCResultUrl(url)

      if (!oidcResult) {
        return reject(INVALID_CALLBACK)
      }

      resolve(oidcResult)
      subscription.remove()
      void closeInAppBrowser()
    })
  })
}
