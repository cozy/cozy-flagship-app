import React, { useCallback, useState, useEffect } from 'react'
import { BackHandler } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

import Minilog from 'cozy-minilog'
import { useNativeIntent } from 'cozy-intent'

import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsUtils } from '/components/webviews/jsInteractions/jsUtils'
import { useLauncherContext } from '/screens/home/hooks/useLauncherContext'
import {
  jsEnsureCrypto,
  tryCrypto
} from '/components/webviews/jsInteractions/jsEnsureCrypto'
import {
  jsEnsureNavigatorShare,
  tryNavigatorShare
} from '/components/webviews/jsInteractions/jsEnsureNavigatorShare'
import {
  jsEnsureNavigatorClipboard,
  tryNavigatorClipboard
} from '/components/webviews/jsInteractions/jsEnsureNavigatorClipboard'
import {
  jsLogInterception,
  tryConsole
} from '/components/webviews/jsInteractions/jsLogInterception'
import { postMessageFunctionDeclaration } from '/components/webviews/CryptoWebView/jsInteractions/jsFunctions/jsMessaging'
import { jsSubscribers } from '/components/webviews/jsInteractions/jsSubscribers'
import strings from '/constants/strings.json'
import { launcherEvent } from '/libs/ReactNativeLauncher'
import { useSession } from '/hooks/useSession'
import ReloadInterceptorWebView from '/components/webviews/ReloadInterceptorWebView'
import { getHostname } from '/libs/functions/getHostname'
import { useIsSecureProtocol } from '/hooks/useIsSecureProtocol'
import {
  BiometryEmitter,
  makeFlagshipMetadataInjection
} from '/app/domain/authentication/services/BiometryService'

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
  componentId,
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

  const { tryHandleLauncherMessage } = useLauncherContext()

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

  const onCryptoAnswer = useCallback(
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

  const onNavigatorShareAnswer = useCallback(
    (messageId, response) => {
      const payload = JSON.stringify({
        type: 'NavigatorShare',
        messageId,
        param: response
      })

      webviewRef.postMessage(payload)
    },
    [webviewRef]
  )

  const onNavigatorClipboardAnswer = useCallback(
    (messageId, response) => {
      const payload = JSON.stringify({
        type: 'NavigatorClipboard',
        messageId,
        param: response
      })

      webviewRef.postMessage(payload)
    },
    [webviewRef]
  )

  useEffect(() => {
    const handleLoginSucess = accountId => {
      const payload = JSON.stringify({
        type: 'Clisk',
        message: 'loginSuccess',
        param: {
          accountId
        }
      })
      webviewRef?.postMessage(payload)
    }
    launcherEvent.on('loginSuccess', handleLoginSucess)
    return () => launcherEvent.removeListener('loginSuccess', handleLoginSucess)
  }, [webviewRef])

  useEffect(() => {
    const handleLaunchResult = param => {
      const payload = JSON.stringify({
        type: 'Clisk',
        message: 'launchResult',
        param
      })
      webviewRef?.postMessage(payload)
    }
    launcherEvent.on('launchResult', handleLaunchResult)
    return () =>
      launcherEvent.removeListener('launchResult', handleLaunchResult)
  }, [webviewRef])

  const run = `
    (function() {
      ${jsCozyGlobal(route.name, isSecureProtocol)}

      ${jsUtils}

      ${jsLogInterception}

      ${injectedJavaScriptBeforeContentLoaded}

      ${postMessageFunctionDeclaration}

      ${jsSubscribers}

      ${jsEnsureCrypto}

      ${jsEnsureNavigatorShare}

      ${jsEnsureNavigatorClipboard}

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
      originWhitelist={strings.ORIGIN_WHITELIST}
      useWebKit={true}
      javaScriptEnabled={true}
      ref={ref => {
        setWebviewRef(ref)
        setParentRef?.(ref)
      }}
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
      onLoad={event => {
        if (trackWebviewInnerUri) {
          trackWebviewInnerUri(event.nativeEvent.url)
        }

        rest.onLoad?.(event)
      }}
      onMessage={async m => {
        tryCrypto(m, log, logId, onCryptoAnswer)
        tryNavigatorShare(m, log, logId, onNavigatorShareAnswer)
        tryNavigatorClipboard(m, log, logId, onNavigatorClipboardAnswer)
        tryConsole(m, log, logId)
        nativeIntent?.tryEmit(m, componentId)
        tryHandleLauncherMessage(m)
        if (parentOnMessage) {
          parentOnMessage(m)
        }
      }}
      targetUri={uri}
    />
  ) : null
}

export default CozyWebView
