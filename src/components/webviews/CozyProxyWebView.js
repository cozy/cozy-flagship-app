import React, { useState, useEffect } from 'react'
import { Platform, View } from 'react-native'

import { useClient } from 'cozy-client'

import { CozyWebView } from './CozyWebView'
import { updateCozyAppBundleInBackground } from '/libs/cozyAppBundle/cozyAppBundle'
import { useHttpServerContext } from '/libs/httpserver/httpServerProvider'
import { IndexInjectionWebviewComponent } from '/components/webviews/webViewComponents/IndexInjectionWebviewComponent'

import { styles } from './CozyProxyWebView.styles'

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
  const [html, setHtml] = useState(undefined)

  useEffect(() => {
    if (httpServerContext.isRunning()) {
      const initHtmlContent = async () => {
        const htmlContent = await httpServerContext.getIndexHtmlForSlug(
          slug,
          client
        )

        setHtml(htmlContent)

        updateCozyAppBundleInBackground({
          slug,
          client
        })
      }

      initHtmlContent()
    }
  }, [client, httpServerContext, slug, href])

  const { source, nativeConfig } = getPlaformSpecificConfig(href, html)

  return (
    <View style={{ ...styles.view, ...style }}>
      {source && html ? (
        <CozyWebView
          source={source}
          nativeConfig={nativeConfig}
          injectedIndex={html}
          {...props}
        />
      ) : null}
    </View>
  )
}
