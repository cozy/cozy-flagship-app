import React, {useEffect, useState} from 'react'
import {WebView} from 'react-native-webview'
import {useNativeIntent} from 'cozy-intent'

export const CozyAppView = ({route, navigation}) => {
  const run = `
    window.cozy = {
      isFlagshipApp: true
    };
    return true;
    `
  const [ref, setRef] = useState('')
  const nativeIntent = useNativeIntent()

  useEffect(() => {
    if (ref) {
      nativeIntent.registerWebview(ref, {
        scanner: () => {
          return navigation.navigate('scanner')
        },
      })
    }
  }, [nativeIntent, ref, navigation])

  return (
    <WebView
      injectedJavaScriptBeforeContentLoaded={run}
      source={{uri: route.params.href}}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      useWebKit={true}
      ref={setRef}
      onMessage={nativeIntent.tryEmit}
    />
  )
}
