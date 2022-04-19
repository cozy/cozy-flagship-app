import React, { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import {
  subscribeToCrypto,
  unsubscribeFromCrypto,
  sendAnswer
} from './cryptoObservable/cryptoObservable'
import { html } from './jsInteractions/jsCryptoInjection'

/**
 * Lorsque la webview se rend, elle initialise un script JS de hash de mot de passe
 * Ce script est appelé par un observer "CryptoObservable"
 * La webview s'enregistre auprès du CryptoObservable par `subscribeToCrypto` et lui fournit un callback
 * Lorsque ce callback est appelé par l'observable, la crypto transfert le message au JS qui calcule le hash
 * et le retourne par postMessage
 * Dans le postMessage on appelle sendAnswer() avec le mot de passe hashé
 */
export const CryptoWebView = () => {
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
