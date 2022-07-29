import React, { useState, useEffect } from 'react'
import { Platform, View } from 'react-native'

import { useClient } from 'cozy-client'

import { CozyWebView } from './CozyWebView'
import { updateCozyAppBundleInBackground } from '/libs/cozyAppBundle/cozyAppBundle'
import { useHttpServerContext } from '/libs/httpserver/httpServerProvider'
import { IndexInjectionWebviewComponent } from '/components/webviews/webViewComponents/IndexInjectionWebviewComponent'

import { styles } from './CozyProxyWebView.styles'

const NO_INJECTED_HTML = 'NO_INJECTED_HTML'

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

export const CozyProxyWebView = ({ slug, href, style, ...props }) => {
  const client = useClient()
  const httpServerContext = useHttpServerContext()
  const [state, dispatch] = useState({
    source: undefined,
    html: undefined,
    nativeConfig: undefined
  })

  useEffect(() => {
    if (httpServerContext.isRunning()) {
      const initHtmlContent = async () => {
        const htmlContent = await httpServerContext.getIndexHtmlForSlug(
          slug,
          client
        )

        const { source: sourceActual, nativeConfig: nativeConfigActual } =
          getPlaformSpecificConfig(href, htmlContent || NO_INJECTED_HTML)

        dispatch({
          html: htmlContent,
          nativeConfig: nativeConfigActual,
          source: sourceActual
        })

        updateCozyAppBundleInBackground({
          slug,
          client
        })
      }

      if (slug) {
        initHtmlContent()
      } else {
        dispatch({
          html: undefined,
          nativeConfig: undefined,
          source: { uri: href }
        })
      }
    }
  }, [client, httpServerContext, slug, href])

  return (
    <View style={{ ...styles.view, ...style }}>
      {state.source && state.html ? (
        <CozyWebView
          source={state.source}
          nativeConfig={state.nativeConfig}
          injectedIndex={state.html}
          {...props}
        />
      ) : null}
    </View>
  )
}
