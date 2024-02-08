import React, { useCallback, useEffect, useState } from 'react'
import { WebView } from 'react-native-webview'

import Minilog from 'cozy-minilog'
import { useClient } from 'cozy-client'

import { RemountProgress } from '/app/view/Loading/RemountProgress'
import { resyncCookies } from '/libs/httpserver/httpCookieManager'
import { APPLICATION_NAME_FOR_USER_AGENT } from '/constants/userAgent'

const log = Minilog('SupervisedWebView')

Minilog.enable()

const RELOAD_DELAY_IN_MS = 2000
const RELOAD_MAX_DELAY_IN_MS = 10000

const initialState = {
  isReloading: false,
  isLoaded: true,
  shouldBeLoaded: false,
  reloadDelay: RELOAD_DELAY_IN_MS
}

/**
 * Display a react-native WebView that is supervised in order to reload it
 * when terminated
 *
 * More info (iOS): https://nevermeant.dev/handling-blank-wkwebviews/
 * More info (Android): https://developer.android.com/reference/android/webkit/WebViewClient#onRenderProcessGone(android.webkit.WebView,%20android.webkit.RenderProcessGoneDetail)
 *
 * In order to test this component on iOS:
 * - open the app in an iOS simulator
 * - open the MacOS Activity Monitor and look for `com.apple.WebKit.WebContent` processes
 * - kill the WKWebView you want to test
 *   - the higher the PID is, the later the WKWebView was instanciated
 *   - so first process should be the CryptoWebView, second one should be the HomeView and later should be CozyAppViews
 *
 * In order to test this component on Android:
 * - edit CozyWebView to call `webviewRef.injectJavaScript('javascript:(function() { txt = \"a\"; while(1){ txt += \"a\"; } })();')` with a button
 * - open the app in an Android emulator
 * - click the button and wait for the infinite loop to crash the webview
 * - note: do not inject this code from a Chrome inspector. This won't work as fast and this will make your computer's Chrome unresponsive too
 * - note: navigating to `chrome://crash` as stated in the Android documentation won't work as the WebView would prevent the navitation to any local resource
 *
 * Extending type for now, should migrate this file to TS later on.
 * @type extends WebView
 */
export const SupervisedWebView = React.forwardRef((props, ref) => {
  const client = useClient()
  const [state, setState] = useState({
    ...initialState,
    key: 0
  })

  const { onLoad, supervisionShowProgress = true, ...otherProps } = props
  const { isReloading, isLoaded, shouldBeLoaded, key, reloadDelay } = state

  useEffect(
    function verifyLoadSuccess() {
      if (isReloading) {
        log.debug('Wait for loading ' + key)
        let timeout = setTimeout(() => {
          log.debug('Finished waiting for loading ' + key)
          setState(oldState => ({ ...oldState, shouldBeLoaded: true }))
        }, reloadDelay)

        return () => clearTimeout(timeout)
      }
    },
    [isReloading, key, reloadDelay]
  )

  useEffect(
    function reloadIfLoadFailed() {
      if (shouldBeLoaded && !isLoaded) {
        log.debug('WebView failed to load')
        reloadWebView()
      } else if (shouldBeLoaded && isLoaded) {
        log.debug('WebView did successfuly load')
        setState(oldState => ({ ...oldState, ...initialState }))
      }
    },
    [shouldBeLoaded, isLoaded, reloadWebView]
  )

  const reloadWebView = useCallback(async () => {
    log.debug('Trying to reload the WebView')

    if (client) {
      // In some scenario CookieManager cookies are not applied to the WebView on
      // iOS reload (when killed while app in background state)
      // To prevent this we enforce resetting cookies
      await resyncCookies(client)
    }

    setState(oldState => ({
      ...oldState,
      key: oldState.key + 1,
      isLoaded: false,
      shouldBeLoaded: false,
      isReloading: true,
      reloadDelay: oldState.shouldBeLoaded
        ? RELOAD_MAX_DELAY_IN_MS
        : RELOAD_DELAY_IN_MS
    }))
  }, [client])

  return (
    <>
      <WebView
        applicationNameForUserAgent={APPLICATION_NAME_FOR_USER_AGENT}
        {...otherProps}
        ref={ref}
        key={key}
        onContentProcessDidTerminate={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          log.warn('WebView terminated, reloading', nativeEvent)
          reloadWebView()
        }}
        onRenderProcessGone={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          log.warn('WebView crashed, reloading', nativeEvent)
          reloadWebView()
        }}
        onLoad={syntheticEvent => {
          setState(oldState => ({ ...oldState, isLoaded: true }))
          onLoad?.(syntheticEvent)
        }}
      />
      {!isLoaded && supervisionShowProgress && <RemountProgress />}
    </>
  )
})

SupervisedWebView.displayName = 'SupervisedWebView'

export default SupervisedWebView
