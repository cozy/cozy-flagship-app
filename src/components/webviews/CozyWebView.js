import React, { useCallback, useState, useEffect } from 'react'
import { BackHandler, Linking } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import Minilog from '@cozy/minilog'

import { useNativeIntent } from 'cozy-intent'

import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import {
  jsEnsureCrypto,
  tryCrypto
} from '/components/webviews/jsInteractions/jsEnsureCrypto'
import {
  jsEnsureNavigatorShare,
  tryNavigatorShare
} from '/components/webviews/jsInteractions/jsEnsureNavigatorShare'
import {
  jsLogInterception,
  tryConsole
} from '/components/webviews/jsInteractions/jsLogInterception'
import { postMessageFunctionDeclaration } from '/components/webviews/CryptoWebView/jsInteractions/jsFunctions/jsMessaging'
import { jsSubscribers } from '/components/webviews/jsInteractions/jsSubscribers'
import { useSession } from '/hooks/useSession'
import ReloadInterceptorWebView from '/components/webviews/ReloadInterceptorWebView'
import { getHostname } from '/libs/functions/getHostname'
import { useIsSecureProtocol } from '/hooks/useIsSecureProtocol'
import {
  BiometryEmitter,
  makeFlagshipMetadataInjection
} from '/libs/intents/setBiometryState'

const log = Minilog('CozyWebView')

Minilog.enable()

export const CozyWebView = ({
  onMessage: parentOnMessage,
  logId = '',
  source,
  trackWebviewInnerUri,
  route,
  injectedJavaScriptBeforeContentLoaded,
  setParentRef,
  ...rest
}) => {
  const isSecureProtocol = useIsSecureProtocol()
  const [webviewRef, setWebviewRef] = useState()
  const [uri, setUri] = useState()
  const [innerUri, setInnerUri] = useState()
  const nativeIntent = useNativeIntent()
  const { shouldInterceptAuth, handleInterceptAuth, consumeSessionToken } =
    useSession()
  const isFocused = useIsFocused()
  /**
   * First render: no uri
   * Second render: use uri from props
   * We're doing this to handle the cases were uri was modified by the handleInterceptAuth() function
   * On subsequent renders, if the uri props ever change, it will override the session_code uri created by handleInterceptAuth()
   */
  useEffect(() => {
    setUri(source.uri || source.baseUrl)
  }, [source.uri, source.baseUrl])

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
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
  }, [handleBackPress])

  useEffect(() => {
    innerUri &&
      webviewRef &&
      nativeIntent?.registerWebview(innerUri, webviewRef)

    return () =>
      innerUri && webviewRef && nativeIntent?.unregisterWebview(innerUri)
  }, [innerUri, nativeIntent, webviewRef])

  const onAnswer = useCallback(
    (messageId, response) => {
      const payload = JSON.stringify({
        type: 'Crypto',
        messageId,
        param: response
      })

      webviewRef.postMessage(payload)
    },
    [webviewRef]
  )

  const run = `
    (function() {
      ${jsCozyGlobal(route.name, isSecureProtocol)}

      ${jsLogInterception}

      ${injectedJavaScriptBeforeContentLoaded}

      ${postMessageFunctionDeclaration}

      ${jsSubscribers}

      ${jsEnsureCrypto}

      ${jsEnsureNavigatorShare}

      return true;
    })();
  `

  const webviewSource = source.html ? source : { uri }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const injectSettings = async () =>
    webviewRef.injectJavaScript(await makeFlagshipMetadataInjection())

  useEffect(() => {
    webviewRef && injectSettings()

    BiometryEmitter.on('change', injectSettings)

    return () => BiometryEmitter.off('change', injectSettings)
  }, [injectSettings, webviewRef])

  return uri ? (
    <ReloadInterceptorWebView
      {...rest}
      onNavigationStateChange={event => {
        const isValidUri = getHostname(event)
        isValidUri && setInnerUri(isValidUri)
        setCanGoBack(event.canGoBack)
      }}
      source={webviewSource}
      injectedJavaScriptBeforeContentLoaded={run}
      originWhitelist={['http://*', 'https://*', 'intent://*']}
      useWebKit={true}
      javaScriptEnabled={true}
      ref={ref => {
        setWebviewRef(ref)
        setParentRef?.(ref)
      }}
      TEST_ONLY_setRef={setWebviewRef}
      decelerationRate="normal" // https://github.com/react-native-webview/react-native-webview/issues/1070
      onShouldStartLoadWithRequest={initialRequest => {
        if (
          initialRequest.url.startsWith('tel:') ||
          initialRequest.url.startsWith('mailto:') ||
          initialRequest.url.startsWith('maps:') ||
          initialRequest.url.startsWith('geo:') ||
          initialRequest.url.startsWith('sms:')
        ) {
          Linking.openURL(initialRequest.url).catch(error => {
            log.error('Failed to open Link: ' + error.message)
          })
          return false
        }

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
      onLoad={event => {
        if (trackWebviewInnerUri) {
          trackWebviewInnerUri(event.nativeEvent.url)
        }

        rest.onLoad?.(event)
      }}
      onMessage={async m => {
        tryCrypto(m, log, logId, onAnswer)
        tryNavigatorShare(m, log, logId, onAnswer)
        tryConsole(m, log, logId)

        nativeIntent.tryEmit(m)

        if (parentOnMessage) {
          parentOnMessage(m)
        }
      }}
      targetUri={uri}
    />
  ) : null
}

export default CozyWebView
