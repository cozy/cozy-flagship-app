import EventEmitter from 'events'

import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native'

import Minilog from 'cozy-minilog'

const log = Minilog('🛋️ PlatormReactNative.appState')

let appState = AppState.currentState
let appStateHandler: NativeEventSubscription | undefined = undefined

export const listenAppState = (eventEmitter: EventEmitter): void => {
  appStateHandler = AppState.addEventListener('change', nextAppState => {
    log.debug('🛋️ AppState event', nextAppState)
    if (isGoingToSleep(nextAppState)) {
      eventEmitter.emit('resume')
    }
    if (isGoingToWakeUp(nextAppState)) {
      eventEmitter.emit('pause')
    }

    appState = nextAppState
  })
}

export const stopListeningAppState = (): void => {
  appStateHandler?.remove()
}

const isGoingToSleep = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/active/) && nextAppState === 'background')

const isGoingToWakeUp = (nextAppState: AppStateStatus): boolean =>
  Boolean(appState.match(/background/) && nextAppState === 'active')
