import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { WebView } from 'react-native-webview'

import Minilog from '@cozy/minilog'

const log = Minilog('SupervisedWebView')

Minilog.enable()

const RELOAD_DELAY_IN_MS = 10000

/**
 * Display a react-native WebView that is supervised in order to reload it
 * when terminated by iOS
 *
 * More info: https://nevermeant.dev/handling-blank-wkwebviews/
 *
 * In order to test this component:
 * - open the app in an iOS simulator
 * - open the MacOS Activity Monitor and look for `com.apple.WebKit.WebContent` processes
 * - kill the WKWebView you want to test
 *   - the higher the PID is, the later the WKWebView was instanciated
 *   - so first process should be the CryptoWebView, second one should be the HomeView and later should be CozyAppViews
 */
export const SupervisedWebView =
  Platform.OS !== 'ios'
    ? WebView
    : React.forwardRef((props, ref) => {
        const [state, setState] = useState({
          isLoaded: false,
          shouldBeLoaded: false,
          key: 0
        })

        const { onLoad, ...otherProps } = props
        const { isLoaded, shouldBeLoaded, key } = state

        useEffect(
          function verifyLoadSuccess() {
            if (shouldBeLoaded) {
              log.debug('Wait for loading ' + key)
              let timeout = setTimeout(() => {
                log.debug('Finished waiting for loading ' + key)
                setState(oldState => ({ ...oldState, shouldBeLoaded: true }))
              }, RELOAD_DELAY_IN_MS)

              return () => clearTimeout(timeout)
            }
          },
          [shouldBeLoaded, key]
        )

        useEffect(
          function reloadIfLoadFailed() {
            if (shouldBeLoaded && !isLoaded) {
              log.debug('WebView failed to load')
              reloadWebView()
            } else if (shouldBeLoaded && isLoaded) {
              log.debug('WebView did successfuly load')
            }
          },
          [shouldBeLoaded, isLoaded]
        )

        const reloadWebView = () => {
          log.debug('Trying to reload the WebView')
          setState(oldState => ({
            ...oldState,
            key: oldState.key + 1,
            isLoaded: false,
            shouldBeLoaded: false
          }))
        }

        return (
          <WebView
            {...otherProps}
            ref={ref}
            key={key}
            onContentProcessDidTerminate={syntheticEvent => {
              const { nativeEvent } = syntheticEvent
              log.warn('WebView terminated, reloading', nativeEvent)
              reloadWebView()
            }}
            onLoad={syntheticEvent => {
              setState(oldState => ({ ...oldState, isLoaded: true }))
              onLoad?.(syntheticEvent)
            }}
          />
        )
      })

SupervisedWebView.displayName = 'SupervisedWebView'

export default SupervisedWebView
