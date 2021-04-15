import React, {useEffect, useRef} from 'react'
import {domain, cozy, slug} from '../../../config.json'
import {get} from 'lodash'
import {WebView} from 'react-native-webview'

const injectLauncherRef = (webViewRef) => {
  const run = `
     window.cozy.ClientConnectorLauncher = 'react-native'
     console.log('Injected Launcher reference')
    `
  webViewRef.current.injectJavaScript(run)
}

const HarvestView = (props) => {
  const {setLauncherContext} = props
  const webViewRef = useRef()
  useEffect(() => injectLauncherRef(webViewRef))
  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      source={{uri: `https://${cozy}-home.${domain}/#connected/${slug}/new`}}
      sharedCookiesEnabled={true}
      onMessage={(m) => {
        const data = get(m, 'nativeEvent.data')
        if (data) {
          const {message, value} = JSON.parse(data)
          if (message === 'startLauncher') {
            setLauncherContext(value)
          }
        }
      }}
    />
  )
}

export default HarvestView
