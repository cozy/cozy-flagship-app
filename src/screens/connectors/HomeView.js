import React from 'react'
import {get} from 'lodash'
import {WebView} from 'react-native-webview'
import {useClient} from 'cozy-client'

const HomeView = (props) => {
  const client = useClient()
  const {uri} = client.getStackClient()
  const token = client.getStackClient().getAccessToken()
  const [scheme, cozyDomain] = uri.split('://')
  const cozyToken = token
  const {setLauncherContext} = props
  const cozyClientConf = {
    scheme,
    lang: 'fr',
    cozyDomain,
    cozyToken,
  }
  const run = `
    window.cozy = {
      ClientConnectorLauncher: 'react-native',
      clientSideSlugs: ['ameli', 'sncf', 'blablacar', 'template'],
    };
    window.cozyClientConf = ${JSON.stringify(cozyClientConf)}
    return true;
    `
  return (
    <WebView
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      source={{uri: 'file:///android_asset/home/index.html'}}
      injectedJavaScriptBeforeContentLoaded={run}
      onMessage={(m) => {
        const data = get(m, 'nativeEvent.data')
        if (data) {
          const {message, value} = JSON.parse(data)
          if (message === 'startLauncher') {
            setLauncherContext({state: 'launch', value})
          }
        }
      }}
    />
  )
}

export default HomeView
