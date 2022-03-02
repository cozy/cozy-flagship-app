import React, {useState, useEffect} from 'react'
import {WebView} from 'react-native-webview'
import Minilog from '@cozy/minilog'
import {useNativeIntent} from 'cozy-intent'
import {useSession} from '../../hooks/useSession.js'

import {jsCozyGlobal} from './jsInteractions/jsCozyInjection'
import {jsLogInterception, tryConsole} from './jsInteractions/jsLogInterception'
import {jsCSSclassInjection} from './jsInteractions/jsCSSclassInjection'

const log = Minilog('CozyWebView')

Minilog.enable()

const CozyWebView = ({
  navigation,
  onShouldStartLoadWithRequest,
  onMessage: parentOnMessage,
  logId = '',
  source,
  trackWebviewInnerUri,
  route,
  ...rest
}) => {
  const [ref, setRef] = useState('')
  const [uri, setUri] = useState()
  const nativeIntent = useNativeIntent()
  const {shouldInterceptAuth, handleInterceptAuth, consumeSessionToken} =
    useSession()

  /**
   * First render: no uri
   * Second render: use uri from props
   * We're doing this to handle the cases were uri was modified by the handleInterceptAuth() function
   * On subsequent renders, if the uri props ever change, it will overrides the session_code uri created by handleInterceptAuth()
   */
  useEffect(() => {
    setUri(source.uri)
  }, [source.uri])

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

      ${jsCSSclassInjection(route.name)}

      return true;
    })();
  `

  return uri ? (
    <WebView
      {...rest}
      source={{uri}}
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
