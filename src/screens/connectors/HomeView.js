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
    const getHomeUri = async () => {
      setUri(
        generateWebLink({
          cozyUrl: client.getStackClient().uri,
          pathname: '/',
          slug: 'home',
          subDomainType: await getSubDomainType(),
        }),
      )
    }

    const getSubDomainType = async () => {
      try {
        const {
          data: {
            attributes: {flat_subdomains},
          },
        } = await client.query(Q('io.cozy.settings').getById('capabilities'))

        return flat_subdomains ? 'flat' : 'nested'
      } catch (error) {
        // Defaulting to flat if for whatever reason the subDomainType could not be fetched
        return 'flat'
      }
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

    getHomeUri()
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
