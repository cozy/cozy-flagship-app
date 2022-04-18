import React, { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import {
  subscribeToCrypto,
  unsubscribeFromCrypto,
  sendAnswer
} from './cryptoObservable/cryptoObservable'
import { html } from './jsInteractions/jsCryptoInjection'

export const CryptoWebView = () => {
  const webviewRef = useRef()

  const processMessage = (message, messageId, param) => {
    const payload = JSON.stringify({
      message: message,
      messageId: messageId,
      param: param
    })

    const webView = webviewRef.current
    webView.postMessage(payload)
  }

  const processAnswer = event => {
    const answer = JSON.parse(event.nativeEvent.data)
    sendAnswer(answer)
  }

  useEffect(() => {
    subscribeToCrypto(processMessage)

    return () => {
      unsubscribeFromCrypto(processMessage)
    }
  }, [webviewRef])

  return (
    <View style={{ height: 0 }}>
      <WebView
        ref={webviewRef}
        javaScriptEnabled={true}
        onMessage={processAnswer}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost' }}
      />
    </View>
  )
}
