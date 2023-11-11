import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import { useEffect } from 'react'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import strings from '/constants/strings.json'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { showSplashScreen } from '/app/theme/SplashScreenService'

const log = Minilog('NetService')

// Function to configure NetInfo service with the given client
const configureService = (client?: CozyClient): void => {
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
      configureService(client)
    }

    client?.on('logout', configure)

    configure()

    return () => {
      client?.removeListener('logout', configure)
    }
  }, [client])

const waitForOnline = (
  callbackRoute: string,
  params?: Record<string, unknown>
): void => {
  log.debug('Adding NetInfo listener')

  // Define the unsubscribe function inside the listener
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      log.debug('NetService is online, navigating to callback route')

      callbackRoute === routes.stack && showSplashScreen().catch(log.error)

      try {
        navigate(callbackRoute, params)
      } catch (error) {
        log.error(error)
      }

      log.debug('NetService redirect done, removing NetInfo listener')
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

export const NetService = {
  handleOffline,
  isConnected,
  isOffline
}
