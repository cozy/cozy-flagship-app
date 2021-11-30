import React, {useEffect, useState} from 'react'
import {get} from 'lodash'
import CozyWebView from '../CozyWebView'
import {useClient, Q, generateWebLink} from 'cozy-client'

import {clearClient} from '../../libs/client'

const HomeView = ({route, navigation, setLauncherContext}) => {
  const client = useClient()
  const [uri, setUri] = useState('')
  const [run, setRun] = useState('')

  useEffect(() => {
    const getCapabilities = async () => {
      const {data} = await client.query(
        Q('io.cozy.settings').getById('capabilities'),
      )

      setUri(
        generateWebLink({
          cozyUrl: client.getStackClient().uri,
          pathname: '/',
          slug: 'home',
          subDomainType: data.attributes.flat_subdomains ? 'flat' : 'nested',
        }),
      )
    }

    const konnectorParam = get(route, 'params.konnector')
    if (konnectorParam) {
      setUri(`${uri}#/connected/${konnectorParam}`)
    }
    const token = client.getStackClient().getAccessToken()
    const [scheme, cozyDomain] = uri.split('://')
    const cozyToken = token
    const cozyClientConf = {
      scheme,
      lang: 'fr',
      cozyDomain,
      cozyToken,
    }

    setRun(`
      window.cozy = {
        ClientConnectorLauncher: 'react-native',
        isWebview: true
      };
      window.cozyClientConf = ${JSON.stringify(cozyClientConf)}
      return true;
      `)

    getCapabilities()
  }, [uri, client, run, route])

  return uri ? (
    <CozyWebView
      source={{uri}}
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
  ) : null
}

export default HomeView
