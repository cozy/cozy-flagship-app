import React, {useMemo} from 'react'
import {get} from 'lodash'
import {WebView} from 'react-native-webview'
import {useClient} from 'cozy-client'
import {generateWebLink} from 'cozy-ui/transpiled/react/AppLinker'

const HOME_URL = 'file:///android_asset/home/index.html'

const HomeView = ({route, navigation, setLauncherContext}) => {
  let initUrl = HOME_URL
  const slugParam = get(route, 'params.slug')
  if (slugParam) {
    initUrl += `#/connected/${slugParam}`
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
    return true;
    `

  const storeAddUrl = useMemo(() => {
    const {subdomain: subDomainType} = client.getInstanceOptions()
    return generateWebLink({
      cozyUrl: new URL(uri).origin,
      slug: 'store',
      subDomainType,
    })
  }, [uri])

  return (
    <WebView
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      source={{uri: initUrl}}
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
      onShouldStartLoadWithRequest={(request) => {
        if (isStoreUrl(request.url)) {
          navigation.push('store', {url: request.url})
          return false
        }
        return true
      }}
    />
  )
}

function isStoreUrl({url, storeAddUrl}) {
  return url.includes(storeAddUrl.split('#').shift())
}

export default HomeView
