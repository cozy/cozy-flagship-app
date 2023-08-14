import { useEffect } from 'react'
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native'

import Minilog from 'cozy-minilog'
import CozyClient, { useClient } from 'cozy-client'

import { StorageKeys, storeData } from '/libs/localStore/storage'
import { showSplashScreen } from '/app/theme/SplashScreenService'
import {
  handleSecurityFlowWakeUp,
  setIsSecurityFlowPassed
} from '/app/domain/authorization/services/SecurityService'
import { devlog } from '/core/tools/env'
import { synchronizeDevice } from '/app/domain/authentication/services/SynchronizeService'
import { safePromise } from '/utils/safePromise'
import { clearFilesToUpload } from '/app/domain/sharing/services/SharingService'

const log = Minilog('useGlobalAppState')

// Runtime variables
let appState: AppStateStatus = AppState.currentState

const handleSleep = (): void => {
  clearFilesToUpload()
  setIsSecurityFlowPassed(false)

  showSplashScreen()
    .then(async () => {
      return await storeData(StorageKeys.LastActivity, Date.now().toString())
    })
    .catch(reason => log.error('Failed when going to sleep', reason))
}

const handleWakeUp = (client: CozyClient): void => {
  handleSecurityFlowWakeUp(client)
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
