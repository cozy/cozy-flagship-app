import React, { useCallback, useEffect, useRef, useState } from 'react'
import { get } from 'lodash'
import { useFocusEffect } from '@react-navigation/native'
import { AppState } from 'react-native'

import {
  deconstructCozyWebLinkWithSlug,
  generateWebLink,
  useClient
} from 'cozy-client'
import { useNativeIntent } from 'cozy-intent'
import Minilog from 'cozy-minilog'

import { CozyProxyWebView } from '/components/webviews/CozyProxyWebView'
import {
  consumeRouteParameter,
  useInitialParam
} from '/libs/functions/routeHelpers'
import { resetUIState } from '/libs/intents/setFlagshipUI'
import { useSession } from '/hooks/useSession'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'
import { launcherEvent } from '/libs/ReactNativeLauncher'
import { determineSecurityFlow } from '/app/domain/authorization/services/SecurityService'
import { devlog } from '/core/tools/env'
import { useSharingState } from '/app/view/Sharing/SharingState'

const log = Minilog('🏠 HomeView')

const unzoomHomeView = webviewRef => {
  try {
    webviewRef?.injectJavaScript(
      'window.dispatchEvent(new Event("closeApp"));true;'
    )
  } catch (e) {
    // When reloading the CozyProxyWebView after HTML_CONTENT_EXPIRATION_DELAY_IN_MS
    // then this JS injection can fail due to a race condition (during the reload process the WebView is unmount)
    // This is not problematic as the newly refreshed WebView is already zoomed out
    // However we still want to log this as an error to keep track of unexpected scenario
    log.error('Error while calling unzoomHomeView', e.message)
  }
}

/**
 * @typedef Props
 * @prop {(arg: import('/libs/konnectors/models').LauncherContext) => void} setLauncherContext
 * @prop {unknown} navigation
 * @prop {unknown} route
 * @prop {(arg: import('/libs/intents/setFlagshipUI').BarStyle) => void} setBarStyle
 */

/**
 * @param {Props} props
 */
const HomeView = ({ route, navigation, setLauncherContext, setBarStyle }) => {
  const client = useClient()
  const [uri, setUri] = useState('')
  const { shouldWaitCozyApp, setShouldWaitCozyApp } = useHomeStateContext()
  const [trackedWebviewInnerUri, setTrackedWebviewInnerUri] = useState('')
  const nativeIntent = useNativeIntent()
  const session = useSession()
  const didBlurOnce = useRef(false)
  const [webviewRef, setParentRef] = useState()
  const { sharingIntentStatus } = useSharingState()
  const mainAppFallbackURLInitialParam = useInitialParam(
    'mainAppFallbackURL',
    route,
    navigation
  )
  const cozyAppFallbackURLInitialParam = useInitialParam(
    'cozyAppFallbackURL',
    route,
    navigation
  )
  const hasRenderedOnce = useRef(false)

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      nextAppState => nextAppState === 'active' && unzoomHomeView(webviewRef)
    )

    return subscription.remove
  }, [webviewRef])

  useEffect(() => {
    const handleLoginSucess = accountId => {
      const payload = JSON.stringify({
        type: 'Clisk',
        message: 'loginSuccess',
        param: {
          accountId
        }
      })
      webviewRef?.postMessage(payload)
    }
    launcherEvent.on('loginSuccess', handleLoginSucess)
    return () => launcherEvent.removeListener('loginSuccess', handleLoginSucess)
  }, [webviewRef])

  useEffect(() => {
    const handleLaunchResult = param => {
      const payload = JSON.stringify({
        type: 'Clisk',
        message: 'launchResult',
        param
      })
      webviewRef?.postMessage(payload)
    }
    launcherEvent.on('launchResult', handleLaunchResult)
    return () =>
      launcherEvent.removeListener('launchResult', handleLaunchResult)
  }, [webviewRef])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      didBlurOnce.current = true
      if (trackedWebviewInnerUri && client.isLogged) {
        setUri(trackedWebviewInnerUri)
      }
    })

    return unsubscribe
  }, [navigation, trackedWebviewInnerUri, client])

  useFocusEffect(
    useCallback(() => {
      if (didBlurOnce.current) {
        devlog(
          'HomeView: useFocusEffect, didBlurOnce.current: true, unzoom Home View, resetting UI State'
        )

        unzoomHomeView(webviewRef)

        resetUIState(uri, setBarStyle)
      }
    }, [setBarStyle, uri, webviewRef])
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

          const accountParam = consumeRouteParameter(
            'account',
            route,
            navigation
          )
          if (accountParam) {
            url.hash += `/accounts/${accountParam}`
          }

          const targetUri = url.toString()
          setUri(targetUri)
        }
      }
    }, [navigation, route, uri])
  )

  useEffect(() => {
    const href = consumeRouteParameter('href', route, navigation)
    const mainAppFallbackURL = mainAppFallbackURLInitialParam.consume()
    const deepLink = href || mainAppFallbackURL

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
  }, [uri, client, route, mainAppFallbackURLInitialParam, navigation, session])

  useEffect(() => {
    devlog(
      `HomeView: determineSecurityFlowHook, hasRenderedOnce.current: "${hasRenderedOnce.current}"`
    )

    async function handleSecurityFlowAndCozyAppFallback() {
      let navigationObject = null

      if (uri) {
        const cozyAppFallbackURL = cozyAppFallbackURLInitialParam.consume()

        if (cozyAppFallbackURL) {
          setShouldWaitCozyApp(true)
          const subdomainType = client.capabilities?.flat_subdomains
            ? 'flat'
            : 'nested'
          const { slug } = deconstructCozyWebLinkWithSlug(
            cozyAppFallbackURL,
            subdomainType
          )

          navigationObject = {
            navigation,
            href: cozyAppFallbackURL,
            slug
          }
        } else {
          if (shouldWaitCozyApp === undefined) {
            setShouldWaitCozyApp(false)
          }
        }
      }

      // If client exists and this is the first render, determine the security flow.
      if (uri && client && !hasRenderedOnce.current) {
        devlog(
          `HomeView: setting hasRenderedOnce.current set to "true" and calling determineSecurityFlowHook()`
        )
        hasRenderedOnce.current = true
        await determineSecurityFlow(
          client,
          navigationObject,
          true,
          sharingIntentStatus
        )
      }
    }

    void handleSecurityFlowAndCozyAppFallback()
  }, [
    client,
    cozyAppFallbackURLInitialParam,
    navigation,
    shouldWaitCozyApp,
    setShouldWaitCozyApp,
    uri,
    sharingIntentStatus
  ])

  const handleTrackWebviewInnerUri = webviewInneruri => {
    if (webviewInneruri !== trackedWebviewInnerUri) {
      setTrackedWebviewInnerUri(webviewInneruri)
    }
  }

  return uri && shouldWaitCozyApp !== undefined && !shouldWaitCozyApp ? (
    <CozyProxyWebView
      setParentRef={setParentRef}
      slug="home"
      href={uri}
      trackWebviewInnerUri={handleTrackWebviewInnerUri}
      navigation={navigation}
      route={route}
      logId="HomeView"
      onMessage={async event => {
        const data = get(event, 'nativeEvent.data')

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
