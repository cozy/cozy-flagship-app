import React, {useEffect, useRef} from 'react'
import {StyleSheet, View, Text} from 'react-native'
import {WebView} from 'react-native-webview'

const URI_BLABLACAR = 'https://www.blablacar.fr/login/email'
const CozyApp = () => {
  const webViewRef = useRef()

  const content = `
      document.body.style.backgroundColor = 'blue';
      true;
    `

  useEffect(() => {
    setTimeout(() => {
      const run = `
        window.ReactNativeWebView.postMessage("Hello!")
        document.body.style.backgroundColor = 'red';
      `
      webViewRef.current.injectJavaScript(run)
    }, 3000)
  }, [])

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        useWebKit={true}
        javaScriptEnabled={true}
        source={{uri: URI_BLABLACAR}}
        style={styles.webView}
        injectedJavaScript={content}
        onMessage={event => {
          const {data} = event.nativeEvent
          console.log(data)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1},
  webView: {},
})

export default CozyApp
