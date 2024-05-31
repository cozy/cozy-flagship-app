import { EventEmitter } from 'events'

import { listenAppState } from '/pouchdb/platformReactNative.appState'
import { listenNetInfo } from '/pouchdb/platformReactNative.netInfo'

export const pouchDbEmitter = new EventEmitter()

const listenPouchEvents = (): void => {
  listenAppState(pouchDbEmitter)
  listenNetInfo(pouchDbEmitter)
}

listenPouchEvents()

export const events = {
  addEventListener: (
    eventName: string,
    handler: (...args: unknown[]) => void
  ): void => {
    pouchDbEmitter.addListener(eventName, handler)
  },
  removeEventListener: (
    eventName: string,
    handler: (...args: unknown[]) => void
  ): void => {
    pouchDbEmitter.removeListener(eventName, handler)
  }
}
