import Minilog from 'cozy-minilog'
import CozyClient from 'cozy-client'

import { StorageKeys, storeData, removeData } from '/libs/localStore/storage'

const log = Minilog('LoginScreen')

/**
 * Clears the storage key related to client authentication
 */
export const clearClient = (): Promise<void> => {
  return removeData(StorageKeys.Oauth)
}

/**
 * save cozy-client authentication information in mobile storage
 *
 * @param {CozyClient} client : client instance
 */
export const saveClient = async (client: CozyClient): Promise<void> => {
  const { uri, oauthOptions, token } = client.getStackClient()

  const state = {
    oauthOptions,
    token,
    uri
  }

  return storeData(StorageKeys.Oauth, state)
}

export const listenTokenRefresh = (client: CozyClient): void => {
  client.on('tokenRefreshed', () => {
    log.debug('Token has been refreshed')
    void saveClient(client)
  })
}
