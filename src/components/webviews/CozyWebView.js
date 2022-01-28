import React, {useState, useEffect} from 'react'
import {WebView} from 'react-native-webview'
import Minilog from '@cozy/minilog'
import {useNativeIntent} from 'cozy-intent'
import {useSession} from '../../hooks/useSession.js'

const log = Minilog('CozyWebView')

Minilog.enable()

const CozyWebView = ({
  navigation,
  onShouldStartLoadWithRequest,
  onMessage: parentOnMessage,
  ...rest
}) => {
  const [ref, setRef] = useState('')
  const nativeIntent = useNativeIntent()
  const {shouldInterceptAuth, handleInterceptAuth, consumeSessionToken} =
    useSession()

  useEffect(() => {
    if (ref) {
      nativeIntent.registerWebview(ref)
    }

    return () => {
      if (ref) {
        nativeIntent.unregisterWebview(ref)
      }
    }
  }, [nativeIntent, ref])

  const run = `
    (function() { 
      window.cozy = {
        isFlagshipApp: "true",
        ClientConnectorLauncher: "react-native",
      };
      return true;
    })();
  `

  return (
    <WebView
      {...rest}
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
        nativeIntent.tryEmit(m)

        if (parentOnMessage) {
          parentOnMessage(m)
        }
      }}
    />
  )
}

export default CozyWebView
