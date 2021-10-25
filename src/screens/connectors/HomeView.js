import React, {useMemo} from 'react'
import {get} from 'lodash'
import CozyWebView, {COZY_PREFIX} from '../CozyWebView'
import {useClient} from 'cozy-client'
import {generateWebLink} from 'cozy-ui/transpiled/react/AppLinker'

const HOME_URL = 'file:///android_asset/home/index.html'

const HomeView = ({route, navigation, setLauncherContext}) => {
  let initUrl = HOME_URL
  const connectorParam = get(route, 'params.connector')
  if (connectorParam) {
    initUrl += `#/connected/${connectorParam}`
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
  }, [client, uri])

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
      onShouldStartLoadWithRequest={(request) => {
        if (isStoreUrl({url: request.url, storeAddUrl})) {
          return {
            ...request,
            url: `${COZY_PREFIX}?app=store`,
            originalRequest: request,
          }
        }
        return request
      }}
    />
  )
}

function isStoreUrl({url, storeAddUrl}) {
  return url.includes(storeAddUrl.split('#').shift())
}

export default HomeView
