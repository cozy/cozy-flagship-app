import NetInfo, {
  NetInfoState,
  NetInfoStateType
} from '@react-native-community/netinfo'
import { useEffect } from 'react'

import CozyClient from 'cozy-client'
import Minilog from '@cozy/minilog'

import strings from '/strings.json'
import { devConfig } from '/config/dev'
import { reset } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { showSplashScreen } from '/libs/services/SplashScreenService'

const log = Minilog('NetService')

if (devConfig.forceOffline) {
  NetInfo.fetch = (): Promise<NetInfoState> =>
    Promise.resolve({
      details: null,
      isConnected: false,
      isInternetReachable: false,
      type: NetInfoStateType.none
    })
}

const configureService = (client?: CozyClient): void => {
  NetInfo.configure({
    reachabilityUrl: client?.isLogged
      ? `${(client.getStackClient() as { uri: string }).uri}/${
          strings.reachability.stack
        }`
      : strings.reachability.cloud
  })
}

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

const waitForOnline = (callbackRoute: string): void => {
  log.debug('Adding NetInfo listener')

  const callback = (state: NetInfoState): void => {
    if (state.isConnected) {
      log.debug('Removing NetInfo listener')

      callbackRoute === routes.stack && showSplashScreen()

      try {
        reset(callbackRoute)
      } catch (error) {
        log.error(error)
      }

      unsubscribe()
    }
  }

  const unsubscribe = NetInfo.addEventListener(callback)
}

const isConnected = async (): Promise<NetInfoState['isConnected']> =>
  (await NetInfo.fetch()).isConnected

const isOffline = async (): Promise<NetInfoState['isConnected']> =>
  (await NetInfo.fetch()).isConnected === false

const handleOffline = (callbackRoute: string): void => {
  reset(routes.error, { type: strings.errorScreens.offline })

  waitForOnline(callbackRoute)
}

export const NetService = {
  handleOffline,
  isConnected,
  isOffline
}
