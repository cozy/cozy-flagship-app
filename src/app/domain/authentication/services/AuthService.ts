import { EventEmitter } from 'events'

import Minilog from '@cozy/minilog'

import type CozyClient from 'cozy-client'

import { asyncLogout } from '/libs/intents/localMethods'
import { safePromise } from '/utils/safePromise'

export const authLogger = Minilog('[AuthService]')
const emitter = new EventEmitter()

let userRevoked = false
let clientInstance: CozyClient | null = null

// Setter
export const setUserRevoked = (status: boolean): void => {
  userRevoked = status
  authLogger.info(`User revoked set to "${String(status)}"`)

  if (userRevoked) emitter.emit('userRevoked', userRevoked)
  if (!userRevoked) safePromise(handleOnUnrevoked)()
}

// Getter
export const isUserRevoked = (): boolean => userRevoked

// Handle token error
const handleTokenError = (): void => {
  authLogger.warn('Token revoked')
  setUserRevoked(true)
}

// Handle user confirmation of the error
const handleOnUnrevoked = async (): Promise<void> => {
  try {
    if (clientInstance === null) throw new Error('No client instance set')
    authLogger.info('User confirmed the error, logging out')
    await asyncLogout(clientInstance)
  } catch (error) {
    authLogger.error('Error while logging out', error)
  } finally {
    authLogger.info('Clearing user confirmation to refresh interface')
    emitter.emit('userLoggedOut', false)
  }
}

// Start listening to cozy-client and AuthService event
export const startListening = (client: CozyClient): void => {
  authLogger.info('Start listening to cozy-client events')
  clientInstance = client

  clientInstance.on('revoked', () => {
    authLogger.info('Token revoked')
    handleTokenError()
  })
}

export const AuthService = {
  emitter,
  isUserRevoked,
  setUserRevoked,
  startListening
}
