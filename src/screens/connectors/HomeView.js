import React, {useEffect, useState} from 'react'
import {Platform} from 'react-native'
import {get} from 'lodash'
import CozyWebView from '../CozyWebView'
import {useClient} from 'cozy-client'
import RNFS from 'react-native-fs'

const HOME_URL = 'file:///android_asset/home/index.html'

const HomeView = ({route, navigation, setLauncherContext}) => {
  const [content, setContent] = useState()
  useEffect(() => {
    const readContent = async () => {
      const data = await RNFS.readFile(RNFS.MainBundlePath + '/www/index.html')
      setContent(data)
    }
    if (Platform.OS === 'ios') {
      readContent().catch((e) => console.log('error reading html file', e))
    }
  })

  let initUrl
  if (Platform.OS === 'android') {
    initUrl = HOME_URL
  }
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
  const webviewSourceObject =
    Platform.OS === 'ios'
      ? {
          html: content,
          baseUrl: RNFS.MainBundlePath + '/www/',
        }
      : {
          uri: initUrl,
        }
  return (
    <CozyWebView
      source={webviewSourceObject}
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
