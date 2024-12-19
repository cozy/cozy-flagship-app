import { Linking } from 'react-native'

import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'
import PouchLink from 'cozy-pouch-link'

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
    void Linking.openURL('mailto:support@cozycloud.cc')
  } catch (error) {
    authLogger.error('Error while opening email app', error)
  }
}

const handleLogin = (): void => {
  try {
    authLogger.info('Debounce replication')
    if (clientInstance === null) throw new Error('No client instance set')

    const pouchLink = getPouchLink(clientInstance)
    pouchLink?.startReplicationWithDebounce()
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

const getPouchLink = (client?: CozyClient): PouchLink | null => {
  if (!client) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return client.links.find(link => link instanceof PouchLink) || null
}
