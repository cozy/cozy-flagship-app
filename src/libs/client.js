import CozyClient from 'cozy-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

import apiKeys from '../api-keys.json'
import strings from '../strings.json'

/**
 * Clears the storage key related to client authentication
 */
export const clearClient = () => {
  return AsyncStorage.removeItem(strings.OAUTH_STORAGE_KEY)
}

/**
 * save cozy-client authentication information in mobile storage
 *
 * @param {CozyClient} client : client instance
 */
export const saveClient = async client => {
  const {uri, oauthOptions, token} = client.getStackClient()
  const state = JSON.stringify({
    oauthOptions,
    token,
    uri,
  })

  return AsyncStorage.setItem(strings.OAUTH_STORAGE_KEY, state)
}

/**
 * Get a cozy client instance, initialized with authentication information from mobile storage
 *
 * @returns {CozyClient}
 */
export const getClient = async () => {
  const val = await AsyncStorage.getItem(strings.OAUTH_STORAGE_KEY)
  if (!val) {
    return false
  }
  const state = JSON.parse(val)
  const {uri, oauthOptions, token} = state
  const client = new CozyClient({
    uri,
    oauth: {token},
    oauthOptions,
  })
  return client
}

/**
 * Initialize a new CozyClient instance from the given uri with user interaction
 *
 * @param {String} uri : cozy uri
 * @returns {CozyClient}
 */
export const initClient = async (uri, options) => {
  const client = new CozyClient(options)
  await client.register(uri)
  await client.login()
  return client
}

export const callInitClient = async uri => {
  // Your IDE might tell you the following 'await' has no effect, this seems to be a mistake
  const client = await initClient(uri, {
    scope: [
      '*',
    ],
    oauth: {
      redirectURI: strings.COZY_SCHEME,
      softwareID: 'amiral',
      clientKind: 'mobile',
      clientName: 'Amiral',
      shouldRequireFlagshipPermissions: true,
      certificationConfig: {
        androidSafetyNetApiKey: apiKeys.androidSafetyNetApiKey,
      },
    },
  })
  await saveClient(client)
  return client
}
