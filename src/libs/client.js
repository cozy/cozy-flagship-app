import CozyClient from 'cozy-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const OAUTH_STORAGE_KEY = '@cozy_AmiralAppOAuthConfig'

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
  const { uri, oauthOptions } = client.getStackClient()
  const token = client.getStackClient().getAccessToken()
  const state = JSON.stringify({
    oauthOptions,
    token,
    uri
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
  const { uri, oauthOptions, token } = state
  const client = new CozyClient({
    uri,
    token,
    oauthOptions
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
