import { Linking } from 'react-native'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { asyncLogoutNoClient } from '/app/domain/authentication/utils/asyncLogoutNoClient'
import { triggerPouchReplication } from '/app/domain/offline/utils'

export const authLogger = Minilog('AuthService')
let clientInstance: CozyClient | null = null
const DELAY_BEFORE_REPLICATION = 10000 // 10 sec

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
    void Linking.openURL('mailto:support@cozycloud.cc')
  } catch (error) {
    authLogger.error('Error while opening email app', error)
  }
}

const handleLogin = (): void => {
  try {
    authLogger.info('Debounce replication')
    if (clientInstance === null) throw new Error('No client instance set')

    setTimeout(() => {
      if (clientInstance) {
        // Use custom delay for this special case: we want the replication to happen
        // fast enough to ensure all data is retrieved, but not too fast, to avoid
        // slowing down the user login
        triggerPouchReplication(clientInstance, { withDebounce: false })
      }
    }, DELAY_BEFORE_REPLICATION)
  } catch (error) {
    authLogger.error('Error while handling login', error)
  }
}

export const startListening = (client: CozyClient): void => {
  authLogger.info('Start listening to cozy-client events')
  clientInstance = client
  clientInstance.on('revoked', handleTokenError)
  clientInstance.on('login', handleLogin)
}
