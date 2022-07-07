import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'

import { useClient, generateWebLink } from 'cozy-client'
import { useNativeIntent } from 'cozy-intent'

import { CozyProxyWebView } from '/components/webviews/CozyProxyWebView'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { resetUIState } from '/libs/intents/setFlagshipUI'
import { useSession } from '/hooks/useSession'
import { AppState } from 'react-native'

const HomeView = ({ route, navigation, setLauncherContext }) => {
  const client = useClient()
  const [uri, setUri] = useState('')
  const [trackedWebviewInnerUri, setTrackedWebviewInnerUri] = useState('')
  const nativeIntent = useNativeIntent()
  const session = useSession()
  const didBlurOnce = useRef(false)

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      nextAppState =>
        nextAppState === 'active' && nativeIntent?.call(uri, 'closeApp')
    )

    return () => subscription.remove()
  }, [nativeIntent, uri])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      didBlurOnce.current = true
      setUri(trackedWebviewInnerUri)
    })

    return unsubscribe
  }, [navigation, uri, trackedWebviewInnerUri])

  useFocusEffect(
    useCallback(() => {
      if (didBlurOnce.current) {
        nativeIntent.call(uri, 'closeApp')
        resetUIState(uri)
      }
    }, [nativeIntent, uri])
  )

  useFocusEffect(
    useCallback(() => {
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
    }, [navigation, route, uri])
  )

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

  return uri ? (
    <CozyProxyWebView
      slug="home"
      href={uri}
      trackWebviewInnerUri={handleTrackWebviewInnerUri}
      navigation={navigation}
      route={route}
      logId="HomeView"
      onMessage={async event => {
        const data = event?.nativeEvent?.data

        if (data) {
          const { methodName, message, value } = JSON.parse(data)

          if (methodName === 'openApp') nativeIntent?.call(uri, 'openApp')

          if (message === 'startLauncher')
            setLauncherContext({ state: 'launch', value })
        }
      }}
    />
  ) : null
}

export default HomeView
