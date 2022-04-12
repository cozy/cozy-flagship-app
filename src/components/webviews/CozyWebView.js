import Minilog from '@cozy/minilog'
import React, {useCallback, useState, useEffect} from 'react'
import {BackHandler} from 'react-native'
import {WebView} from 'react-native-webview'
import {useIsFocused} from '@react-navigation/native'

import {useNativeIntent} from 'cozy-intent'

import {jsCSSclassInjection} from './jsInteractions/jsCSSclassInjection'
import {jsCozyGlobal} from './jsInteractions/jsCozyInjection'
import {jsLogInterception, tryConsole} from './jsInteractions/jsLogInterception'
import {useSession} from '../../hooks/useSession.js'

const log = Minilog('CozyWebView')

Minilog.enable()

export const CozyWebView = ({
  navigation,
  onShouldStartLoadWithRequest,
  onMessage: parentOnMessage,
  logId = '',
  source,
  trackWebviewInnerUri,
  route,
  injectedJavaScriptBeforeContentLoaded,
  ...rest
}) => {
  const [webviewRef, setWebviewRef] = useState()
  const [uri, setUri] = useState()
  const nativeIntent = useNativeIntent()
  const {shouldInterceptAuth, handleInterceptAuth, consumeSessionToken} =
    useSession()
  const isFocused = useIsFocused()
  /**
   * First render: no uri
   * Second render: use uri from props
   * We're doing this to handle the cases were uri was modified by the handleInterceptAuth() function
   * On subsequent renders, if the uri props ever change, it will overrides the session_code uri created by handleInterceptAuth()
   */
  useEffect(() => {
    setUri(source.uri)
  }, [source.uri])

  const [canGoBack, setCanGoBack] = useState(false)

  const handleBackPress = useCallback(() => {
    if (!canGoBack || !isFocused) {
      return false
    }

    webviewRef.goBack()
    return true
  }, [canGoBack, isFocused, webviewRef])

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress)

    return () =>
      BackHandler.removeEventListener('hardwareBackpress', handleBackPress)
  }, [handleBackPress])

  useEffect(() => {
    if (webviewRef) {
      log.info(`[Native ${logId}] registerWebview`)
      nativeIntent.registerWebview(webviewRef)
    }

    return () => {
      if (webviewRef) {
        log.info(`[Native ${logId}] unregisterWebview`)
        nativeIntent.unregisterWebview(webviewRef)
      }
    }
  }, [nativeIntent, webviewRef, logId])

  const run = `
    (function() {
      ${jsCozyGlobal}

      ${jsLogInterception}

      ${jsCSSclassInjection(route.name)}

      ${injectedJavaScriptBeforeContentLoaded}

      return true;
    })();
  `

  return uri ? (
    <WebView
      {...rest}
      onNavigationStateChange={event => {
        setCanGoBack(event.canGoBack)
      }}
      source={{uri}}
      injectedJavaScriptBeforeContentLoaded={run}
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      ref={ref => setWebviewRef(ref)}
      TEST_ONLY_setRef={setWebviewRef}
      decelerationRate="normal" // https://github.com/react-native-webview/react-native-webview/issues/1070
      onShouldStartLoadWithRequest={initialRequest => {
        if (shouldInterceptAuth(initialRequest.url)) {
          const asyncRedirect = async () => {
            const authLink = await handleInterceptAuth(initialRequest.url)
            await consumeSessionToken()
            setUri(authLink)
          }

          asyncRedirect()
          return false
        } else {
          return true
        }
      }}
      onLoad={({nativeEvent}) => {
        if (trackWebviewInnerUri) {
          trackWebviewInnerUri(nativeEvent.url)
        }
      }}
      onMessage={async m => {
        tryConsole(m, log, logId)

        nativeIntent.tryEmit(m)

        if (parentOnMessage) {
          parentOnMessage(m)
        }
      }}
    />
  ) : null
}

export default CozyWebView
