import CozyClient from 'cozy-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

const OAUTH_STORAGE_KEY = '@cozy_AmiralAppOAuthConfig'
const COZY_PREFIX = 'cozy://'

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
export const saveClient = async (client) => {
  const {uri, oauthOptions, token} = client.getStackClient()
  const state = JSON.stringify({
    oauthOptions,
    token,
    uri,
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

export const callInitClient = async (uri) => {
  // Your IDE might tell you the following 'await' has no effect, this seems to be a mistake
  const client = await initClient(uri, {
    scope: [
      'io.cozy.apps',
      'io.cozy.settings',
      'io.cozy.konnectors',
      'io.cozy.jobs',
      'io.cozy.contacts',
      'io.cozy.triggers',
      'io.cozy.permissions',
      'io.cozy.apps.suggestions',
      'com.bitwarden.organizations',
      'com.bitwarden.ciphers',
      'io.cozy.bank.accounts',
      'io.cozy.timeseries.geojson',
      'io.cozy.files.*',
      'io.cozy.bills',
      'io.cozy.accounts',
      'io.cozy.identities',
    ],
    oauth: {
      redirectURI: COZY_PREFIX,
      softwareID: 'amiral',
      clientKind: 'mobile',
      clientName: 'Amiral',
    },
  })
  await saveClient(client)
  return client
}
