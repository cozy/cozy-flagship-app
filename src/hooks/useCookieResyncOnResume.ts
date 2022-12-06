import { AppState, AppStateStatus } from 'react-native'
import { useEffect } from 'react'

import Minilog from '@cozy/minilog'
import CozyClient, { useClient } from 'cozy-client'

import { resyncCookies } from '/libs/httpserver/httpCookieManager'

const log = Minilog('useCookieResyncOnResume')

let appState: AppStateStatus = AppState.currentState

const handleWakeUp = (client?: CozyClient): void => {
  if (client?.isLogged) {
    resyncCookies(client).catch(reason =>
      log.error('Failed when waking up', reason)
    )
  }
}

const isGoingToWakeUp = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/background/) && nextAppState === 'active')

const onStateChange =
  (client: CozyClient) =>
  (nextAppState: AppStateStatus): void => {
    if (isGoingToWakeUp(nextAppState)) handleWakeUp(client)

    appState = nextAppState
  }

/**
 * In some scenario CookieManager cookies are not applied to the WebView on
 * iOS reload (when killed while app in background state)
 * To prevent this we enforce resetting cookies on App's resume
 */
export const useCookieResyncOnResume = (): void => {
  const client = useClient()

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      onStateChange(client)
    )

    return () => {
      appState = AppState.currentState
      subscription.remove()
    }
  }, [client])
}
