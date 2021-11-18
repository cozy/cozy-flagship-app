import React from 'react'
import {get} from 'lodash'
import CozyWebView from '../CozyWebView'
import {useClient} from 'cozy-client'

import {clearClient} from '../../libs/client'
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
      ClientConnectorLauncher: 'react-native',
      isWebview: true
    };
    window.cozyClientConf = ${JSON.stringify(cozyClientConf)}
    return true;
    `

  return (
    <CozyWebView
      source={{uri: initUrl}}
      injectedJavaScriptBeforeContentLoaded={run}
      navigation={navigation}
      onMessage={async (m) => {
        const data = get(m, 'nativeEvent.data')
        if (data) {
          if (data === 'LOGOUT') {
            await clearClient()
            return navigation.navigate('authenticate')
          }

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
