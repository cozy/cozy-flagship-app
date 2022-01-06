import React from 'react'
import {WebView} from 'react-native-webview'

export const CozyAppView = ({route}) => {
  const run = `
    window.cozy = {
      isFlagshipApp: true
    };
    return true;
    `

  return (
    <WebView
      injectedJavaScriptBeforeContentLoaded={run}
      source={{uri: route.params.href}}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      useWebKit={true}
    />
  )
}
