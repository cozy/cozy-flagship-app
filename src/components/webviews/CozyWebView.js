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

  const runCozyGlobal = `
    window.cozy = {
      isFlagshipApp: "true",
      ClientConnectorLauncher: "react-native",
    };
  `

  const runLogInterception = `
    const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
    console = {
      log: (log) => consoleLog('log', log),
      debug: (log) => consoleLog('debug', log),
      info: (log) => consoleLog('info', log),
      warn: (log) => consoleLog('warn', log),
      error: (log) => consoleLog('error', log),
    };
  `

  const run = `
    (function() { 
      ${runCozyGlobal}
      
      ${runLogInterception}

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
        tryConsole(m)

        nativeIntent.tryEmit(m)

        if (parentOnMessage) {
          parentOnMessage(m)
        }
      }}
    />
  )
}

const tryConsole = (payload) => {
  try {
    const dataPayload = JSON.parse(payload.nativeEvent.data)

    if (dataPayload) {
      if (dataPayload.type === 'Console') {
        const {type, log: msg} = dataPayload.data
        log[type](`[Console] ${msg}`)
      }
    }
  } catch (e) {
    log.error(e)
  }
}

export default CozyWebView
