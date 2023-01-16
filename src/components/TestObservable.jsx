import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'react-native'
import { WebView } from 'react-native-webview'
import { queryResultToCrypto } from '/components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'

import {
  subscribeToCrypto,
  unsubscribeFromCrypto,
  sendAnswer
} from '/components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'

const CryptoWebView = () => {
  const [isLoading, setIsLoading] = useState(true)
  const webviewRef = useRef()

  const processMessage = (message, messageId, param) => {
    const payload = JSON.stringify({
      message,
      messageId,
      param
    })

    const webView = webviewRef.current
    webView.postMessage(payload)
  }

  const processAnswer = event => {
    const webviewAnswer = JSON.parse(event.nativeEvent.data)
    sendAnswer(webviewAnswer)
  }

  useEffect(() => {
    if (!isLoading) {
      subscribeToCrypto(processMessage)
    }

    return () => {
      if (!isLoading) {
        unsubscribeFromCrypto(processMessage)
      }
    }
  }, [isLoading, webviewRef])

  const injectedJs =
    require('../../connectors/template/dist/webviewScript.js').content

  return (
    <WebView
      ref={webviewRef}
      javaScriptEnabled={true}
      onMessage={processAnswer}
      onLoadEnd={() => setIsLoading(false)}
      originWhitelist={['*']}
      source={{
        uri: 'http://books.toscrape.com/'
      }}
      injectedJavaScriptBeforeContentLoaded={injectedJs}
    />
  )
}

export const TestObservable = ({iterations}) => {
  const doStart = async () => {
    console.log(`🍎 Observable starts ${iterations} iterations`)
    const start = Date.now()
    for (let i = 0; i < iterations; i++) {
      const result = await queryResultToCrypto('doStuffConnector')
    }

    const end = Date.now()
    const diff = end - start
    console.log('🍎 Observable ellapsed:', diff)
  }

  const onPilotMessage = event => {
    if (this.launcher?.pilot) {
      const messenger = this.launcher.pilot.messenger
      messenger.onMessage.bind(messenger)(event)
    }
  }

  const onPilotError = event => {
    console.error('error event', event)
  }

  return (
    <>
      <CryptoWebView
        mediaPlaybackRequiresUserAction={true}
        originWhitelist={['*']}
        source={{
          uri: 'http://books.toscrape.com/'
        }}
        useWebKit={true}
        javaScriptEnabled={true}
        sharedCookiesEnabled={true}
        onMessage={onPilotMessage}
        onError={onPilotError}
      />
      <Button title="Start" onPress={doStart} />
    </>
  )
}
