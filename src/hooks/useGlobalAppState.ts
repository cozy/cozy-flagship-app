import { useNavigationState } from '@react-navigation/native'
import { useEffect } from 'react'
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native'

import CozyClient, { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import { StorageKeys, storeData } from '/libs/localStore/storage'
import { showSplashScreen } from '/app/theme/SplashScreenService'
import {
  getIsSecurityFlowPassed,
  handleSecurityFlowWakeUp,
  setIsSecurityFlowPassed
} from '/app/domain/authorization/services/SecurityService'
import { devlog } from '/core/tools/env'
import { synchronizeDevice } from '/app/domain/authentication/services/SynchronizeService'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import { useSharingState } from '/app/view/sharing/SharingProvider'
import { SharingIntentStatus } from '/app/domain/sharing/models/SharingState'

const log = Minilog('useGlobalAppState')

// Runtime variables
let appState: AppStateStatus = AppState.currentState

const handleSleep = (): void => {
  showSplashScreen()
    .then(async () => {
      setIsSecurityFlowPassed(false)
      return await storeData(StorageKeys.LastActivity, Date.now().toString())
    })
    .catch(reason => log.error('Failed when going to sleep', reason))
}

const handleWakeUp = async (
  client: CozyClient,
  sharingIntentStatus: SharingIntentStatus
): Promise<void> => {
  await handleSecurityFlowWakeUp(client)

  if (sharingIntentStatus === SharingIntentStatus.OpenedViaSharing) {
    log.info('useGlobalAppState: handleWakeUp, sharing mode')
    navigate(routes.sharing)
  }
}

const isGoingToSleep = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/active/) && nextAppState === 'background')

const isGoingToWakeUp = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/background/) && nextAppState === 'active')

const onStateChange = (
  nextAppState: AppStateStatus,
  client: CozyClient,
  sharingIntentStatus: SharingIntentStatus
): void => {
  if (isGoingToSleep(nextAppState)) handleSleep()

  if (isGoingToWakeUp(nextAppState)) {
    Promise.all([
      handleWakeUp(client, sharingIntentStatus),
      synchronizeDevice(client)
    ]).catch(reason => log.error('Failed when waking up', reason))
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const routeIndex = useNavigationState(state => state?.index)
  const { sharingIntentStatus } = useSharingState()

  // On app start
  useEffect(() => {
    const appStart = async (): Promise<void> => {
      if (await getIsSecurityFlowPassed()) {
        log.info('useGlobalAppState: app start, security flow passed')

        if (sharingIntentStatus === SharingIntentStatus.OpenedViaSharing) {
          log.info('useGlobalAppState: app start, sharing mode')
          navigate(routes.sharing)
        } else {
          log.info('useGlobalAppState: app start, not sharing mode')
        }
      } else {
        log.info('useGlobalAppState: app start, security flow not passed')
      }
    }

    log.info('useGlobalAppState: app start')
    void appStart()
  }, [routeIndex, sharingIntentStatus])

  useEffect(() => {
    let subscription: NativeEventSubscription | undefined

    // If there's no client, we don't need to listen to app state changes
    // because we can't lock the app anyway
    if (client && !subscription) {
      devlog(
        'useGlobalAppState: subscribing to AppState changes, synchronizing device'
      )

      subscription = AppState.addEventListener('change', e =>
        onStateChange(e, client, sharingIntentStatus)
      )
    }

    return () => {
      appState = AppState.currentState
      subscription?.remove()
    }
  }, [client, sharingIntentStatus])
}
