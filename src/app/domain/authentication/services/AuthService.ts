import { Linking } from 'react-native'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { asyncLogoutNoClient } from '/app/domain/authentication/utils/asyncLogoutNoClient'

export const authLogger = Minilog('AuthService')
let clientInstance: CozyClient | null = null

const handleTokenError = async (): Promise<void> => {
  try {
    authLogger.warn('Token revoked')
    if (clientInstance === null) throw new Error('No client instance set')
    clientInstance.removeListener('revoked', handleTokenError)
    authLogger.info('User confirmed the error, logging out')
    await asyncLogoutNoClient()
  } catch (error) {
    authLogger.error('Error while logging out', error)
  }
}

export const handleSupportEmail = (): void => {
  try {
    void Linking.openURL('mailto:support@twake.app')
  } catch (error) {
    authLogger.error('Error while opening email app', error)
  }
}

export const startListening = (client: CozyClient): void => {
  authLogger.info('Start listening to cozy-client events')
  clientInstance = client
  clientInstance.on('revoked', handleTokenError)
}
