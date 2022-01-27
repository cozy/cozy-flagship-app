import React, {useEffect, useState} from 'react'
import {get} from 'lodash'
import {useClient, Q, generateWebLink} from 'cozy-client'
import {useNativeIntent} from 'cozy-intent'

import {useSession} from '../../../hooks/useSession'
import CozyWebView from '../../../components/webviews/CozyWebView'

const HomeView = ({route, navigation, setLauncherContext}) => {
  const client = useClient()
  const [uri, setUri] = useState('')
  const [ref, setRef] = useState('')
  const nativeIntent = useNativeIntent()
  const session = useSession()

  useEffect(() => {
    const {shouldCreateSession, handleCreateSession, consumeSessionToken} =
      session

    if (ref && route.name === 'home') {
      nativeIntent.registerWebview(ref)
    }

    const getHomeUri = async () => {
      const webLink = generateWebLink({
        cozyUrl: client.getStackClient().uri,
        pathname: '/',
        slug: 'home',
        subDomainType: session.subDomainType,
      })

      if (await shouldCreateSession(webLink)) {
        const sessionLink = await handleCreateSession(webLink)
        await consumeSessionToken()

        setUri(sessionLink)
      } else {
        setUri(webLink)
      }
    }

    const konnectorParam = get(route, 'params.konnector')
    if (konnectorParam) {
      setUri(`${uri}#/connected/${konnectorParam}`)
    }

    if (!uri && session.subDomainType) {
      getHomeUri()
    }
  }, [uri, client, route, nativeIntent, ref, navigation, session])

  return uri ? (
    <CozyWebView
      source={{uri}}
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
