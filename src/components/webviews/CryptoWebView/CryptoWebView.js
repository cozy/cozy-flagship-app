import React, { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import {
  subscribeToCrypto,
  unsubscribeFromCrypto,
  sendAnswer
} from './cryptoObservable/cryptoObservable'
import { html } from './jsInteractions/jsCryptoInjection'
import { styles } from './CryptoWebView.styles'

export const CryptoWebView = ({ setHasCrypto }) => {
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
      setHasCrypto?.(true)
    }

    return () => {
      if (!isLoading) {
        unsubscribeFromCrypto(processMessage)
        setHasCrypto?.(false)
      }
    }
  }, [isLoading, setHasCrypto, webviewRef])

  return (
    <View style={styles.cryptoView}>
      <WebView
        ref={webviewRef}
        javaScriptEnabled={true}
        onMessage={processAnswer}
        onLoadEnd={() => setIsLoading(false)}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost' }}
      />
    </View>
  )
}
