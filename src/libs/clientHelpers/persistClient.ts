import Minilog from 'cozy-minilog'
import CozyClient, { OAuthOptions, AccessToken } from 'cozy-client'

import {
  CozyPersistedStorageKeys,
  storeData,
  removeData
} from '/libs/localStore/storage'

const log = Minilog('LoginScreen')

export interface OauthData {
  oauthOptions: OAuthOptions
  token: AccessToken
  uri: string
}

/**
 * Clears the storage key related to client authentication
 */
export const clearClient = (): Promise<void> => {
  return removeData(CozyPersistedStorageKeys.Oauth)
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
  } as OauthData

  return storeData(CozyPersistedStorageKeys.Oauth, state)
}

export const listenTokenRefresh = (client: CozyClient): void => {
  client.on('tokenRefreshed', () => {
    log.debug('Token has been refreshed')
    void saveClient(client)
  })
}
