import React from 'react'
import {get} from 'lodash'
import CozyWebView from '../CozyWebView'
import {useClient} from 'cozy-client'

const HOME_URL = 'file:///android_asset/home/index.html'

const HomeView = ({route, navigation, setLauncherContext}) => {
  let initUrl = HOME_URL
  const konnectorParam = get(route, 'params.konnector')
  if (konnectorParam) {
    initUrl += `#/connected/${konnectorParam}`
  }

  const client = useClient()
  const {uri} = client.getStackClient()
  const token = client.getStackClient().getAccessToken()
  const [scheme, cozyDomain] = uri.split('://')
  const cozyToken = token
  const cozyClientConf = {
    scheme,
    lang: 'fr',
    cozyDomain,
    cozyToken,
  }

  const run = `
    window.cozy = {
      ClientConnectorLauncher: 'react-native'
    };
    window.cozyClientConf = ${JSON.stringify(cozyClientConf)}
    `

  return (
    <CozyWebView
      source={{uri: initUrl}}
      injectedJavaScriptBeforeContentLoaded={run}
      navigation={navigation}
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
