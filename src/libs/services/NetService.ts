import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import { useEffect } from 'react'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import strings from '/constants/strings.json'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { showSplashScreen } from '/app/theme/SplashScreenService'

export const netLogger = Minilog('🛜 NetService')

// Function to configure NetInfo service with the given client
export const configureNetService = (client?: CozyClient): void => {
  NetInfo.configure({
    reachabilityUrl: client?.isLogged
      ? `${client.getStackClient().uri}/${strings.reachability.stack}`
      : strings.reachability.cloud
  })
}

// React hook to handle re-configuration of service on client's logout
export const useNetService = (client?: CozyClient): void =>
  useEffect(() => {
    const configure = (): void => {
      configureNetService(client)
    }

    client?.on('logout', configure)

    configure()

    return () => {
      client?.removeListener('logout', configure)
    }
  }, [client])

const waitForOnline = (
  callbackArg?: string | ((state: NetInfoState) => void),
  params?: Record<string, unknown>
): void => {
  netLogger.debug('Adding NetInfo listener')

  // Define the unsubscribe function inside the listener
  const unsubscribe = NetInfo.addEventListener(state => {
    const isCallbackRoute = typeof callbackArg === 'string' && callbackArg
    const isCallbackFunction = typeof callbackArg === 'function'

    if (state.isConnected) {
      netLogger.debug('Online, using callback parameters:', {
        callbackArg,
        params
      })

      try {
        if (callbackArg === routes.stack)
          showSplashScreen().catch(netLogger.error)

        if (isCallbackRoute) navigate(callbackArg, params)

        if (isCallbackFunction) callbackArg(state)
      } catch (error) {
        netLogger.error(error)
      }

      netLogger.debug('Redirect done, removing NetInfo listener')

      unsubscribe()
    }
  })
}

// Functions to fetch current connection state
const isConnected = async (): Promise<NetInfoState['isConnected']> =>
  (await NetInfo.fetch()).isConnected

const isOffline = async (): Promise<NetInfoState['isConnected']> =>
  (await NetInfo.fetch()).isConnected === false

// Function to handle offline state by navigating to an error route and setting up listener for online state
const handleOffline = (
  callbackRoute: string,
  params?: Record<string, unknown>
): void => {
  navigate(routes.error, { type: strings.errorScreens.offline })

  waitForOnline(callbackRoute, params)
}

const handleOfflineWithCallback = (
  callback: (state: NetInfoState) => void
): void => {
  navigate(routes.error, { type: strings.errorScreens.offline })

  waitForOnline(callback)
}

export const NetService = {
  handleOffline,
  handleOfflineWithCallback,
  isConnected,
  isOffline,
  waitForOnline
}
