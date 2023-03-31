import Minilog from '@cozy/minilog'
import { Linking, Platform } from 'react-native'
import type { WebViewNavigation } from 'react-native-webview'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { closeInAppBrowser, showInAppBrowser } from '/libs/intents/InAppBrowser'

const log = Minilog('CozyWebView.functions')

const OIDC_PARAM = 'oidc'
const USER_CANCELED = 'USER_CANCELED'
const INVALID_CALLBACK = 'INVALID_CALLBACK'

const OIDC_CALLBACK_URL_PARAM = 'redirect_after_oidc'
const OIDC_CALLBACK_URL = 'https://links.mycozy.cloud/flagship/oidc_result'
const OIDC_CALLBACK_URL_ANDROID = 'cozy://flagship/oidc_result'

const OIDC_ONBOARD_CALLBACK_URL_PARAM = 'redirect'
const OIDC_ONBOARD_CALLBACK_URL =
  'https://loginflagship/oidc_onboarding_finished'

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

interface OidcOnboardingEndCallback {
  fqdn: string
  onboardedRedirection: string | null
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

    const onboardUrlWithRedirect = new URL(onboardUrl)
    onboardUrlWithRedirect.searchParams.append(
      OIDC_ONBOARD_CALLBACK_URL_PARAM,
      OIDC_ONBOARD_CALLBACK_URL
    )

    return { code, onboardUrl: onboardUrlWithRedirect.toString() }
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

/**
 * Display InAppBrowser to the given OIDC url
 * @param request - NavigationRequest called by the Cloudery to start the OIDC process
 * @returns OIDC result
 */
export const processOIDC = (
  request: WebViewNavigation
): Promise<OidcCallback> => {
  return new Promise((resolve, reject) => {
    const oidcUrl = new URL(request.url)
    const urlParam =
      Platform.OS === 'ios' ? OIDC_CALLBACK_URL : OIDC_CALLBACK_URL_ANDROID
    oidcUrl.searchParams.append(OIDC_CALLBACK_URL_PARAM, urlParam)

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

/**
 * Extract created instance and onboarded_redirection from NavigationRequest
 * @param request - NavigationRequest called by the Cloudery after Onboarding has been finished
 * @returns Created instance info
 */
export const parseOidcOnboardingFinishedUrl = (
  request: WebViewNavigation
): OidcOnboardingEndCallback | null => {
  try {
    const oidcUrl = new URL(request.url)

    const fqdn = oidcUrl.searchParams.get('fqdn')
    const onboardedRedirection = oidcUrl.searchParams.get(
      'onboarded_redirection'
    )

    if (!fqdn) {
      return null
    }

    return { fqdn, onboardedRedirection }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to extract OIDC Instance creation info from ${request.url} URL: ${errorMessage}`
    )
    return null
  }
}
