import CozyClient from 'cozy-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const OAUTH_STORAGE_KEY = '@cozy_AmiralAppOAuthConfig'
const clientOptions = {
  scope: [
    'io.cozy.files.*',
    'io.cozy.bills',
    'io.cozy.accounts',
    'io.cozy.identities',
  ],
  oauth: {
    redirectURI: 'cozy://',
    softwareID: 'amiral',
    clientKind: 'mobile',
    clientName: 'Amiral',
  },
}

/**
 * Clears the storage key related to client authentication
 */
export const clearClient = () => {
  return AsyncStorage.removeItem(OAUTH_STORAGE_KEY)
}

/**
 * save cozy-client authentication information in mobile storage
 *
 * @param {CozyClient} client : client instance
 */
export const saveClient = (client) => {
  const state = JSON.stringify({
    oauthOptions: client.stackClient.oauthOptions,
    token: client.stackClient.token,
    uri: client.stackClient.uri,
  })
  return AsyncStorage.setItem(OAUTH_STORAGE_KEY, state)
}

/**
 * Get a cozy client instance, initialized with authentication information from mobile storage
 *
 * @returns {CozyClient}
 */
export const getClient = async () => {
  const val = await AsyncStorage.getItem(OAUTH_STORAGE_KEY)
  if (!val) {
    return false
  }

  const state = JSON.parse(val)
  const client = new CozyClient({...clientOptions, uri: state.uri})
  client.stackClient.setToken(state.token)
  client.stackClient.setOAuthOptions(state.oauthOptions)
  await client.login()
  return client
}

/**
 * Initialize a new CozyClient instance from the given uri with user interaction
 *
 * @param {String} uri : cozy uri
 * @returns {CozyClient}
 */
export const initClient = async (uri) => {
  const client = new CozyClient(clientOptions)
  await client.register(uri)
  await client.login()
  return client
}
