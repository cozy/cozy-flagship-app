import Minilog from 'cozy-minilog'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CozyClient from 'cozy-client'

import strings from '/constants/strings.json'

const log = Minilog('LoginScreen')

/**
 * Clears the storage key related to client authentication
 */
export const clearClient = (): Promise<void> => {
  return AsyncStorage.removeItem(strings.OAUTH_STORAGE_KEY)
}

/**
 * save cozy-client authentication information in mobile storage
 *
 * @param {CozyClient} client : client instance
 */
export const saveClient = async (client: CozyClient): Promise<void> => {
  const { uri, oauthOptions, token } = client.getStackClient()
  const state = JSON.stringify({
    oauthOptions,
    token,
    uri
  })

  return AsyncStorage.setItem(strings.OAUTH_STORAGE_KEY, state)
}

export const listenTokenRefresh = (client: CozyClient): void => {
  client.on('tokenRefreshed', () => {
    log.debug('Token has been refreshed')
    void saveClient(client)
  })
}
