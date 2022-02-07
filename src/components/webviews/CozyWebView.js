import React, {useState, useEffect} from 'react'
import {WebView} from 'react-native-webview'
import Minilog from '@cozy/minilog'
import {useNativeIntent} from 'cozy-intent'
import {useSession} from '../../hooks/useSession.js'

import {jsCozyGlobal} from './jsInteractions/jsCozyInjection'
import {jsLogInterception, tryConsole} from './jsInteractions/jsLogInterception'
import {interceptHashAndNavigate} from './jsInteractions/jsNavigation'

const log = Minilog('CozyWebView')

Minilog.enable()

const CozyWebView = ({
  navigation,
  onShouldStartLoadWithRequest,
  onMessage: parentOnMessage,
  logId = '',
  source,
  ...rest
}) => {
  const [ref, setRef] = useState('')
  const nativeIntent = useNativeIntent()
  const {shouldInterceptAuth, handleInterceptAuth, consumeSessionToken} =
    useSession()

  useEffect(() => {
    if (ref) {
      log.info(`[Native ${logId}] registerWebview`)
      nativeIntent.registerWebview(ref)
    }

    return () => {
      if (ref) {
        log.info(`[Native ${logId}] unregisterWebview`)
        nativeIntent.unregisterWebview(ref)
      }
    }
  }, [nativeIntent, ref, logId])

  const run = `
    (function() { 
      ${jsCozyGlobal}
      
      ${jsLogInterception}

      return true;
    })();
  `

  interceptHashAndNavigate(source.uri, ref, log, logId)

  return (
    <WebView
      {...rest}
      source={source}
      injectedJavaScriptBeforeContentLoaded={run}
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      ref={ref => setRef(ref)}
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
      onMessage={async m => {
        tryConsole(m, log, logId)

        nativeIntent.tryEmit(m)

        if (parentOnMessage) {
          parentOnMessage(m)
        }
      }}
    />
  )
}

export default CozyWebView
