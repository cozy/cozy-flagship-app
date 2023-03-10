import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import { useEffect } from 'react'

import CozyClient from 'cozy-client'

import Minilog from '@cozy/minilog'

import strings from '/constants/strings.json'
import { reset } from '/libs/RootNavigation'
import { routes } from '../../core/constants/routes'
import { showSplashScreen } from '/libs/services/SplashScreenService'

const log = Minilog('NetService')

const configureService = (client?: CozyClient): void => {
  NetInfo.configure({
    reachabilityUrl: client?.isLogged
      ? `${client.getStackClient().uri}/${strings.reachability.stack}`
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

      callbackRoute === routes.stack && showSplashScreen().catch(log.error)

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
