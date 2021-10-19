import React from 'react'
import {WebView} from 'react-native-webview'

const run = `
  window.cozy = {
    containerApp : 'amiral'
  };
  return true;
  `

const StoreView = ({route, navigation}) => {
  return (
    <WebView
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      injectedJavaScriptBeforeContentLoaded={run}
      onShouldStartLoadWithRequest={(request) => {
        const test = request.url.match(/cozy:\/\/\?action=(.*)&slug=(.*)/)
        if (test) {
          const [action, slug] = test.slice(1)
          if (action === 'connectorInstalled') {
            navigation.push('home', {slug})
            return false
          }
        }
        return true
      }}
      source={{uri: route.params.url}}
    />
  )
}

export default StoreView
