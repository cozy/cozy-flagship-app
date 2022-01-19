import React, {useEffect, useState} from 'react'
import {get} from 'lodash'
import {useClient, Q, generateWebLink} from 'cozy-client'
import {useNativeIntent} from 'cozy-intent'

import CozyWebView from '../../CozyWebView'

const HomeView = ({route, navigation, setLauncherContext}) => {
  const client = useClient()
  const [uri, setUri] = useState('')
  const [run, setRun] = useState('')
  const [ref, setRef] = useState('')
  const nativeIntent = useNativeIntent()

  useEffect(() => {
    if (ref && route.name === 'home') {
      nativeIntent.registerWebview(ref)
    }

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

    setRun(`
      (function() { 
        window.cozy = {
          isFlagshipApp: "true",
          ClientConnectorLauncher: "react-native",
        };
        return true;
      })();
      `)

    if (!uri) {
      getHomeUri()
    }
  }, [uri, client, run, route, nativeIntent, ref, navigation])

  return uri ? (
    <CozyWebView
      source={{uri}}
      injectedJavaScriptBeforeContentLoaded={run}
      navigation={navigation}
      setRef={setRef}
      onMessage={async m => {
        nativeIntent.tryEmit(m)

        const data = get(m, 'nativeEvent.data')

        if (data) {
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
