import EventEmitter from 'events'

import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo'

import Minilog from 'cozy-minilog'

const log = Minilog('🛋️ PlatormReactNative.netInfo')

let netInfoHandler: NetInfoSubscription | undefined = undefined

export const listenNetInfo = (eventEmitter: EventEmitter): void => {
  netInfoHandler = NetInfo.addEventListener(state => {
    log.debug('🛋️ NetInfo event', state.isConnected)
    if (state.isConnected) {
      eventEmitter.emit('online')
    } else {
      eventEmitter.emit('offline')
    }
  })
}

export const stopListeningNetInfo = (): void => {
  netInfoHandler?.()
}
