import React, { useEffect, useState } from 'react'
import { get } from 'lodash'

import { useClient, generateWebLink } from 'cozy-client'
import { useNativeIntent } from 'cozy-intent'

import CozyWebView from '/components/webviews/CozyWebView'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { resetUIState } from '/libs/intents/setFlagshipUI'
import { statusBarHeight, getNavbarHeight } from '/libs/dimensions'
import { useSession } from '/hooks/useSession'

const injectedJavaScriptBeforeContentLoaded = () => `
  window.addEventListener('load', (event) => {
    window.document.body.style.setProperty('--flagship-top-height', '${statusBarHeight}px');
    window.document.body.style.setProperty('--flagship-bottom-height', '${getNavbarHeight()}px');
  });
`

const HomeView = ({ route, navigation, setLauncherContext }) => {
  const client = useClient()
  const [uri, setUri] = useState('')
  const [trackedWebviewInnerUri, setTrackedWebviewInnerUri] = useState('')
  const nativeIntent = useNativeIntent()
  const session = useSession()

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setUri(trackedWebviewInnerUri)
    })

    return unsubscribe
  }, [navigation, uri, trackedWebviewInnerUri])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (uri) {
        const konnectorParam = consumeRouteParameter(
          'konnector',
          route,
          navigation
        )

        if (konnectorParam) {
          const url = new URL(uri)
          url.hash = `/connected/${konnectorParam}`

          const targetUri = url.toString()
          setUri(targetUri)
        }
      }
    })

    return unsubscribe
  }, [navigation, route, uri])

  useEffect(() => {
    const deepLink = consumeRouteParameter('href', route, navigation)

    if (deepLink) {
      return setUri(deepLink)
    }

    const { shouldCreateSession, handleCreateSession, consumeSessionToken } =
      session

    const getHomeUri = async () => {
      const webLink = generateWebLink({
        cozyUrl: client.getStackClient().uri,
        hash: 'connected',
        pathname: '/',
        slug: 'home',
        subDomainType: session.subDomainType
      })

      if (await shouldCreateSession(webLink)) {
        const sessionLink = await handleCreateSession(webLink)
        await consumeSessionToken()

        setUri(sessionLink)
      } else {
        setUri(webLink)
      }
    }

    if (!uri && session.subDomainType) {
      getHomeUri()
    }
  }, [uri, client, route, nativeIntent, navigation, session])

  const handleTrackWebviewInnerUri = webviewInneruri => {
    if (webviewInneruri !== trackedWebviewInnerUri) {
      setTrackedWebviewInnerUri(webviewInneruri)
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => resetUIState(uri))
    return unsubscribe
  }, [navigation, uri])

  return uri ? (
    <CozyWebView
      source={{ uri }}
      trackWebviewInnerUri={handleTrackWebviewInnerUri}
      navigation={navigation}
      route={route}
      logId="HomeView"
      injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded()}
      onMessage={async m => {
        const data = get(m, 'nativeEvent.data')

        if (data) {
          const { message, value } = JSON.parse(data)

          if (message === 'startLauncher') {
            setLauncherContext({ state: 'launch', value })
          }
        }
      }}
    />
  ) : null
}

export default HomeView
