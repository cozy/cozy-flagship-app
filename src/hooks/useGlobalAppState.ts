import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native'

import CozyClient, { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import { StorageKeys, removeData, storeData } from '/libs/localStore/storage'
import { showSplashScreen } from '/app/theme/SplashScreenService'
import { handleSecurityFlowWakeUp } from '/app/domain/authorization/services/SecurityService'
import { devlog } from '/core/tools/env'
import { synchronizeDevice } from '/app/domain/authentication/services/SynchronizeService'

const log = Minilog('useGlobalAppState')

// Runtime variables
let appState: AppStateStatus = AppState.currentState

const handleSleep = (): void => {
  showSplashScreen('LOCK_SCREEN')
    .then(async () => {
      return await storeData(StorageKeys.LastActivity, Date.now().toString())
    })
    .catch(reason => log.error('Failed when going to sleep', reason))
}

const handleWakeUp = async (
  client: CozyClient,
  isAppStart?: boolean
): Promise<void> => {
  if (isAppStart) {
    await removeData(StorageKeys.LastActivity)
  }

  await handleSecurityFlowWakeUp(client)
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
    Promise.all([handleWakeUp(client), synchronizeDevice(client)]).catch(
      reason => log.error('Failed when waking up', reason)
    )
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
  const isFirstStart = useRef(true)
  const client = useClient()

  useEffect(() => {
    if (!client) return
    void handleWakeUp(client, isFirstStart.current)

    isFirstStart.current = false
  }, [client])

  useEffect(() => {
    let subscription: NativeEventSubscription | undefined

    // If there's no client, we don't need to listen to app state changes
    // because we can't lock the app anyway
    if (client && !subscription) {
      devlog(
        'useGlobalAppState: subscribing to AppState changes, synchronizing device'
      )

      // We never unsubscribe from this event because it will last for the whole app lifecycle
      subscription = AppState.addEventListener('change', e =>
        onStateChange(e, client)
      )
    }

    return () => {
      appState = AppState.currentState
    }
  }, [client])
}
