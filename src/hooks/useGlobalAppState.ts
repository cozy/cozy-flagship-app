import { AppState, AppStateStatus, Platform } from 'react-native'
import { Route } from '@react-navigation/routers'
import { useEffect } from 'react'
import Minilog from '@cozy/minilog'

import * as RootNavigation from '/libs/RootNavigation'
import { getData, StorageKeys, storeData } from '/libs/localStore/storage'
import { routes } from '/constants/routes'
import {
  showSplashScreen,
  hideSplashScreen
} from '/libs/services/SplashScreenService'

const log = Minilog('useGlobalAppState')

const TIMEOUT_VALUE = 5 * 60 * 1000

// Runtime variables
let appState: AppStateStatus = AppState.currentState

const tryLockingApp = async (parsedRoute: Route<string>): Promise<void> => {
  const autoLockEnabled = await getData(StorageKeys.AutoLockEnabled)

  if (autoLockEnabled) {
    RootNavigation.navigate(routes.lock, parsedRoute)
  } else {
    await hideSplashScreen()
  }
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
  if (parsedRoute.name === routes.lock) return false

  if (Platform.OS === 'ios') return true

  return timeSinceLastActivity > TIMEOUT_VALUE
}

const handleWakeUp = (): void => {
  const currentRoute = RootNavigation.navigationRef.getCurrentRoute()
  const parsedRoute = JSON.parse(JSON.stringify(currentRoute)) as Route<string>

  getData<string>(StorageKeys.LastActivity)
    .then((lastActivity): number => {
      const now = Date.now()
      const lastActivityDate = new Date(parseInt(lastActivity ?? '0', 10))

      return now - lastActivityDate.getTime()
    })
    .then(timeSinceLastActivity =>
      _shouldLockApp(parsedRoute, timeSinceLastActivity)
        ? tryLockingApp(parsedRoute)
        : hideSplashScreen()
    )
    .catch(reason => log.error('Failed when waking up', reason))
}

const isGoingToSleep = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/active/) && nextAppState === 'background')

const isGoingToWakeUp = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/background/) && nextAppState === 'active')

const onStateChange = (nextAppState: AppStateStatus): void => {
  if (isGoingToSleep(nextAppState)) handleSleep()

  if (isGoingToWakeUp(nextAppState)) handleWakeUp()

  appState = nextAppState
}

/**
 * This hook is intended as a singleton and should be executed only once.
 * It uses stateful values that are not linked to any component lifecycle.
 *
 * Do NOT use it anywhere else than in the <App /> component,
 * for it could create unintended side effects.
 */
export const useGlobalAppState = (): void =>
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onStateChange)

    return () => {
      appState = AppState.currentState
      subscription.remove()
    }
  }, [])
