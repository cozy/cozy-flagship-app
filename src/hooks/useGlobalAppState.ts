import Minilog from 'cozy-minilog'
import { NavigationContainerRef } from '@react-navigation/native'
import { Route } from '@react-navigation/routers'
import { useEffect } from 'react'
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  Platform
} from 'react-native'

import * as RootNavigation from '/libs/RootNavigation'
import { getData, StorageKeys, storeData } from '/libs/localStore/storage'
import { routes } from '/constants/routes'
import {
  showSplashScreen,
  hideSplashScreen
} from '/app/theme/SplashScreenService'
import { determineSecurityFlow } from '/app/domain/authorization/services/SecurityService'

import CozyClient, { useClient } from 'cozy-client'

import { devlog } from '/core/tools/env'
import { synchronizeDevice } from '/app/domain/authentication/services/SynchronizeService'
import { safePromise } from '/utils/safePromise'

const log = Minilog('useGlobalAppState')

const TIMEOUT_VALUE = 5 * 60 * 1000

// Runtime variables
let appState: AppStateStatus = AppState.currentState

const tryLockingApp = async (
  parsedRoute: Route<string, { href: string; slug: string }>,
  client: CozyClient
): Promise<void> => {
  devlog('tryLockingApp with', { parsedRoute, client })

  return await determineSecurityFlow(
    client,
    // Let's assume the parsedRoute could be undefined for unknown reasons
    // In that case we just don't pass the navigation object and the security flow will default to home
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    parsedRoute?.name !== 'default'
      ? {
          navigation: RootNavigation.navigationRef as NavigationContainerRef<
            Record<string, unknown>
          >,
          href: parsedRoute.params.href,
          slug: parsedRoute.params.slug
        }
      : undefined
  )
}

const handleSleep = (): void => {
  showSplashScreen()
    .then(() => storeData(StorageKeys.LastActivity, Date.now().toString()))
    .catch(reason => log.error('Failed when going to sleep', reason))
}

/**
 * If we went to sleep while on the lock screen, we don't want to lock the app
 *
 * If we went to sleep on an iOS device, we don't want to check the timer and always autolock the app
 *
 * In any other case, we just check the inactivity timer and ask to lock the app if needed
 */
export const _shouldLockApp = (
  parsedRoute: Route<string>,
  timeSinceLastActivity: number
): boolean => {
  try {
    // Accessing a property of parsedRoute will throw an error if it's null or undefined
    if (parsedRoute.name === routes.lock) return false
  } catch (error) {
    // If an error is thrown (i.e., parsedRoute is null or undefined), we default to locking the app
    return true
  }

  if (timeSinceLastActivity < 0) return true

  if (Platform.OS === 'ios') return true

  return timeSinceLastActivity > TIMEOUT_VALUE
}

const handleWakeUp = (client: CozyClient): void => {
  const currentRoute = RootNavigation.navigationRef.getCurrentRoute()
  const parsedRoute = JSON.parse(JSON.stringify(currentRoute)) as Route<
    string,
    { href: string; slug: string }
  >

  getData<string>(StorageKeys.LastActivity)
    .then((lastActivity): number => {
      const now = Date.now()
      const lastActivityDate = new Date(parseInt(lastActivity ?? '0', 10))

      return now - lastActivityDate.getTime()
    })
    .then(timeSinceLastActivity => {
      if (_shouldLockApp(parsedRoute, timeSinceLastActivity))
        return tryLockingApp(parsedRoute, client)
      else {
        devlog(
          'handleWakeUp: no need check the security status, hiding splash screen'
        )
        return hideSplashScreen()
      }
    })
    .catch(reason => log.error('Failed when waking up', reason))
}

const isGoingToSleep = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/active/) && nextAppState === 'background')

const isGoingToWakeUp = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/background/) && nextAppState === 'active')

const onStateChange = (
  nextAppState: AppStateStatus,
  client: CozyClient
): void => {
  if (isGoingToSleep(nextAppState)) handleSleep()

  if (isGoingToWakeUp(nextAppState)) {
    handleWakeUp(client)
    safePromise(synchronizeDevice)(client)
  }

  appState = nextAppState
}

/**
 * This hook is intended as a singleton and should be executed only once.
 * It uses stateful values that are not linked to any component lifecycle.
 *
 * Do NOT use it anywhere else than in the <App /> component,
 * for it could create unintended side effects.
 */
export const useGlobalAppState = (): void => {
  const client = useClient()

  useEffect(() => {
    let subscription: NativeEventSubscription | undefined

    // If there's no client, we don't need to listen to app state changes
    // because we can't lock the app anyway
    if (client && !subscription) {
      devlog(
        'useGlobalAppState: subscribing to AppState changes, synchronizing device'
      )

      subscription = AppState.addEventListener('change', e =>
        onStateChange(e, client)
      )
    }

    return () => {
      appState = AppState.currentState
      subscription?.remove()
    }
  }, [client])
}
