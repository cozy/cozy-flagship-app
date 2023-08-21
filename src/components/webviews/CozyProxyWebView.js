import Minilog from 'cozy-minilog'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useState, useEffect } from 'react'
import { AppState, Platform, View } from 'react-native'

import { useClient } from 'cozy-client'

import { styles } from './CozyProxyWebView.styles'
import { CozyWebView } from './CozyWebView'

import { checkOauthClientsLimit } from '/app/domain/limits/checkOauthClientsLimit'
import { showOauthClientsLimitExceeded } from '/app/domain/limits/OauthClientsLimitService'
import { RemountProgress } from '/app/view/Loading/RemountProgress'
import { updateCozyAppBundleInBackground } from '/libs/cozyAppBundle/cozyAppBundle'
import { useHttpServerContext } from '/libs/httpserver/httpServerProvider'
import { IndexInjectionWebviewComponent } from '/components/webviews/webViewComponents/IndexInjectionWebviewComponent'

const log = Minilog('CozyProxyWebView')

const NO_INJECTED_HTML = 'NO_INJECTED_HTML'

const HTML_CONTENT_EXPIRATION_DELAY_IN_MS = 23 * 60 * 60 * 1000

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

const initHtmlContent = async ({
  httpServerContext,
  slug,
  href,
  client,
  dispatch,
  setHtmlContentCreationDate
}) => {
  const isOauthClientsLimitExeeded = await checkOauthClientsLimit(client)

  if (isOauthClientsLimitExeeded) {
    if (slug === 'home') {
      showOauthClientsLimitExceeded()
    } else if (slug !== 'settings') {
      showOauthClientsLimitExceeded()
      return
    }
  }

  const htmlContent = await httpServerContext.getIndexHtmlForSlug(slug, client)

  const { source: sourceActual, nativeConfig: nativeConfigActual } =
    getPlaformSpecificConfig(href, htmlContent || NO_INJECTED_HTML)

  setHtmlContentCreationDate(Date.now())
  dispatch(oldState => ({
    ...oldState,
    html: htmlContent,
    nativeConfig: nativeConfigActual,
    source: sourceActual
  }))

  updateCozyAppBundleInBackground({
    slug,
    client
  })
}

export const CozyProxyWebView = ({
  slug,
  href,
  onLoad = undefined,
  style,
  ...props
}) => {
  const client = useClient()
  const httpServerContext = useHttpServerContext()
  const [state, dispatch] = useState({
    source: undefined,
    html: undefined,
    nativeConfig: undefined,
    isLoading: false
  })
  const [htmlContentCreationDate, setHtmlContentCreationDate] = useState(
    Date.now()
  )

  const reload = useCallback(() => {
    log.debug('Reloading CozyProxyWebView')
    dispatch({
      source: undefined,
      isLoading: true
    })
    initHtmlContent({
      httpServerContext,
      slug,
      href,
      client,
      dispatch,
      setHtmlContentCreationDate
    })
  }, [client, href, httpServerContext, slug])

  const reloadIfTooOld = useCallback(() => {
    if (
      Date.now() - htmlContentCreationDate >
      HTML_CONTENT_EXPIRATION_DELAY_IN_MS
    ) {
      log.debug(
        'CozyProxyWebView is too old and should be reloaded to refresh tokens'
      )
      reload()
    }
  }, [htmlContentCreationDate, reload])

  useEffect(() => {
    if (httpServerContext.isRunning()) {
      if (slug) {
        initHtmlContent({
          httpServerContext,
          slug,
          href,
          client,
          dispatch,
          setHtmlContentCreationDate
        })
      } else {
        dispatch({
          html: undefined,
          nativeConfig: undefined,
          source: { uri: href }
        })
      }
    }
  }, [client, httpServerContext, slug, href])

  useFocusEffect(
    useCallback(() => {
      reloadIfTooOld()
    }, [reloadIfTooOld])
  )

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        reloadIfTooOld()
      }
    })
    return () => {
      subscription?.remove()
    }
  })

  return (
    <View style={{ ...styles.view, ...style }}>
      {state.source ? (
        <CozyWebView
          source={state.source}
          nativeConfig={state.nativeConfig}
          injectedIndex={state.html}
          reloadProxyWebView={reload}
          onLoad={syntheticEvent => {
            dispatch(oldState => ({ ...oldState, isLoading: false }))
            onLoad?.(syntheticEvent)
          }}
          {...props}
        />
      ) : null}
      {state.isLoading && <RemountProgress />}
    </View>
  )
}
