import React, { useState } from 'react'
import { Platform } from 'react-native'
import { WebView } from 'react-native-webview'

import Minilog from '@cozy/minilog'

const log = Minilog('SupervisedWebView')

Minilog.enable()

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
        const [webViewKey, setWebViewKey] = useState(1)

        return (
          <WebView
            {...props}
            ref={ref}
            key={key}
            onContentProcessDidTerminate={syntheticEvent => {
              const { nativeEvent } = syntheticEvent
              log.warn('WebView terminated, reloading', nativeEvent)
              setWebViewKey(oldKey => oldKey + 1)
            }}
          />
        )
      })

SupervisedWebView.displayName = 'SupervisedWebView'

export default SupervisedWebView
