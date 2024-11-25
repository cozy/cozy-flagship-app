import { Alert, Platform } from 'react-native'

import Minilog from 'cozy-minilog'

import { checkOauthClientsLimit } from '/app/domain/limits/checkOauthClientsLimit'
import { showOauthClientsLimitExceeded } from '/app/domain/limits/OauthClientsLimitService'
import rnperformance from '/app/domain/performances/measure'
import { routes } from '/constants/routes'
import { IndexInjectionWebviewComponent } from '/components/webviews/webViewComponents/IndexInjectionWebviewComponent'
import { updateCozyAppBundleInBackground } from '/libs/cozyAppBundle/cozyAppBundle'
import { getCookie } from '/libs/httpserver/httpCookieManager'

const log = Minilog('CozyProxyWebView.functions')

const NO_INJECTED_HTML = 'NO_INJECTED_HTML'

export const initHtmlContent = async ({
  httpServerContext,
  slug,
  href,
  client,
  dispatch,
  setHtmlContentCreationDate,
  navigation,
  t
}) => {
  rnperformance.mark('initHtmlContent')
  const cookieAlreadyExists = (await getCookie(client)) !== undefined
  log.debug(`Check cookie already exists: ${cookieAlreadyExists}`)

  if (
    cookieAlreadyExists &&
    (await doesOauthClientsLimitPreventsLoading(client, slug, href))
  ) {
    log.debug('Stop loading HTML because OAuth client limit is reached (pre)')
    return
  }

  const { html: htmlContent, source: htmlSource } =
    await httpServerContext.getIndexHtmlForSlug(slug, client)

  if (htmlSource === 'offline') {
    log.debug(
      `Stop loading HTML because cozy-app ${slug} is not available for offline mode`
    )
    Alert.alert(
      t('errors.offline_unsupported_title'),
      t('errors.offline_unsupported_message'),
      undefined,
      {
        cancelable: true
      }
    )
    navigation.navigate(routes.home)
    return
  }

  if (
    !cookieAlreadyExists &&
    (await doesOauthClientsLimitPreventsLoading(client, slug, href))
  ) {
    log.debug('Stop loading HTML because OAuth client limit is reached (post)')
    return
  }

  const { source: sourceActual, nativeConfig: nativeConfigActual } =
    getPlaformSpecificConfig(href, htmlContent || NO_INJECTED_HTML)

  rnperformance.measure('initHtmlContent', 'initHtmlContent')
  setHtmlContentCreationDate(Date.now())
  dispatch(oldState => ({
    ...oldState,
    activateCache: htmlSource === 'cache' && Platform.OS === 'android',
    html: htmlContent,
    nativeConfig: nativeConfigActual,
    source: sourceActual
  }))

  updateCozyAppBundleInBackground({
    slug,
    client
  })
}

const getHttpUnsecureUrl = uri => {
  if (uri) {
    let httpUnsecureUrl = new URL(uri)
    httpUnsecureUrl.protocol = 'http:'

    return httpUnsecureUrl
  }

  return uri
}

/**
 * Retrieve the WebView's configuration for the current platform
 *
 * Android is not compatible with html/baseUrl injection as history would be broken
 *
 * So html/baseUrl injection is done only on iOS
 *
 * Instead, Android version is based on native WebView's ability to intercept queries
 * and override the result. In this case we should use uri instead of html/baseUrl and
 * declare a nativeConfig with IndexInjectionWebviewComponent
 *
 * @param {string} uri - the webView's URI
 * @param {string} html - the HTML to inject as index.html
 * @returns source and nativeConfig props to be set on the WebView
 */
const getPlaformSpecificConfig = (uri, html) => {
  const httpUnsecureUrl = getHttpUnsecureUrl(uri)

  if (html === NO_INJECTED_HTML) {
    return {
      source: { uri },
      nativeConfig: undefined
    }
  }

  const source =
    Platform.OS === 'ios'
      ? { html, baseUrl: httpUnsecureUrl.toString() }
      : { uri }

  const nativeConfig =
    Platform.OS === 'ios'
      ? undefined
      : { component: IndexInjectionWebviewComponent }

  return {
    source,
    nativeConfig
  }
}

/**
 * Checks if OauthClientLimit is reached and trigger the OauthClientsLimitExceeded limit if needed
 * Also check if the WebView rendering should be prevented and returns the result
 *
 * @param {CozyClient} client - CozyClient instance
 * @param {string} slug - The application slug
 * @param {string} href - The WebView requested href
 * @returns true if the WebView rendering should be prevented, false otherwise
 */
const doesOauthClientsLimitPreventsLoading = async (client, slug, href) => {
  const markName = `doesOauthClientsLimitPreventsLoading ${slug}`
  rnperformance.mark(markName)
  const isOauthClientsLimitExeeded = await checkOauthClientsLimit(client)

  if (isOauthClientsLimitExeeded) {
    if (slug === 'home') {
      showOauthClientsLimitExceeded(href)
      rnperformance.measure(
        `doesOauthClientsLimitPreventsLoading ${slug} exceeded -> false`,
        markName
      )
      return false
    } else if (slug !== 'settings') {
      showOauthClientsLimitExceeded(href)
      rnperformance.measure(
        `doesOauthClientsLimitPreventsLoading ${slug} exceeded -> true`,
        markName
      )
      return true
    }
  }

  rnperformance.measure(
    `doesOauthClientsLimitPreventsLoading ${slug} -> false`,
    markName
  )
  return false
}
