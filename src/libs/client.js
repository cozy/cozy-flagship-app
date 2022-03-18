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
  client.getStackClient().setOAuthOptions(oauthOptions)
  await client.login({
    uri,
    token
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

/**
 * Create the OAuth connection for the given Cozy instance
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {string} param.instance - the Cozy instance used to create the client
 * @returns {CozyClient} The CozyClient for the Cozy instance
 */
export const callInitClient = async ({loginData, instance}) => {
  const client = await createClient(instance)

  return await connectClient({
    loginData,
    client,
  })
}

/**
 * Onboard the Cozy instance by specifying its password and encryption keys
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {string} param.instance - the Cozy instance used to create the client
 * @param {string} param.registerToken - the registerToken from the onboarding link that should be used to log in the stack
 * @returns {CozyClient} The created and authenticated CozyClient for the newly onboarded Cozy instance
 */
export const callOnboardingInitClient = async ({
  loginData,
  instance,
  registerToken,
}) => {
  const client = await createClient(instance)
  const stackClient = client.getStackClient()

  await client.certifyFlagship()

  const {passwordHash, hint, iterations, key, publicKey, privateKey} = loginData

  const token = await stackClient.setPassphraseFlagship({
    registerToken,
    passwordHash,
    hint,
    iterations,
    key,
    publicKey,
    privateKey,
  })

  stackClient.setToken(token)

  await client.login()
  await saveClient(client)
  return client
}

/**
 * Create a CozyClient for the given Cozy instance and register it
 *
 * @param {string} instance - the Cozy instance used to create the client
 * @returns {CozyClient} - The created and registered CozyClient
 */
const createClient = async instance => {
  const options = {
    scope: ['*'],
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
  }

  const client = new CozyClient(options)

  const stackClient = client.getStackClient()
  stackClient.setUri(instance)
  await stackClient.register(instance)

  return client
}

/**
 * Process the OAuth dance for the given CozyClient
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {CozyClient} param.client - the CozyClient instance that will be authenticated through OAuth
 * @returns {CozyClient} The authenticated CozyClient
 */
const connectClient = async ({
  loginData,
  client,
}) => {
  const sessionCodeResult = await fetchSessionCode({
    client,
    loginData,
  })

  const sessionCode = sessionCodeResult.session_code

  await client.authorize(undefined, sessionCode)

  await client.login()
  await saveClient(client)

  return client
}

/**
 * Fetch the session code from cozy-stack
 *
 * @param {object} param
 * @param {object} param.client
 * @param {object} param.loginData
 * @returns {string} The query result with session_code
 * @throws
 */
const fetchSessionCode = async ({
  client,
  loginData,
}) => {
  const stackClient = client.getStackClient()

  const sessionCodeResult = await stackClient.fetchSessionCodeWithPassword({
    passwordHash: loginData.passwordHash,
  })

  return sessionCodeResult
}
