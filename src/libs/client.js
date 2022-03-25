import CozyClient from 'cozy-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

import {queryResultToCrypto} from '../components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'

import apiKeys from '../api-keys.json'
import strings from '../strings.json'

export const STATE_CONNECTED = 'STATE_CONNECTED'
export const STATE_AUTHORIZE_NEEDED = 'STATE_AUTHORIZE_NEEDED'
export const STATE_2FA_NEEDED = 'STATE_2FA_NEEDED'
export const STATE_INVALID_PASSWORD = 'STATE_INVALID_PASSWORD'

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
 * @param {CozyClient} [param.client] - an optional CozyClient instance that can be used for the authentication. If not provided a new CozyClient will be created
 * @returns {CozyClientCreationContext} The CozyClient for the Cozy instance with its corresponding state (i.e: connected, waiting for 2FA, invalid password etc)
 */
export const callInitClient = async ({
  loginData,
  instance,
  client: clientParam,
}) => {
  const client = clientParam || (await createClient(instance))

  return await connectClient({
    loginData,
    client,
  })
}

/**
 * Continue the OAuth connection for the given Cozy instance when `callInitClient` has been called but returned a 2FA_NEEDED state
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {CozyClient} param.client - an optional CozyClient instance that can be used for the authentication. If not provided a new CozyClient will be created
 * @returns {CozyClientCreationContext} The CozyClient for the Cozy instance with its corresponding state (i.e: connected, waiting for 2FA, invalid password etc)
 */
export const call2FAInitClient = async ({
  loginData,
  client,
  twoFactorAuthenticationData,
}) => {
  return await connectClient({
    loginData,
    client,
    twoFactorAuthenticationData,
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
export const createClient = async instance => {
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
 * @param {TwoFactorAuthenticationData} param.twoFactorAuthenticationData - the 2FA data containing a token and a passcode
 * @returns {CozyClientCreationContext} The CozyClient with its corresponding state (i.e: connected, waiting for 2FA, invalid password etc)
 */
const connectClient = async ({
  loginData,
  client,
  twoFactorAuthenticationData = undefined,
}) => {
  const sessionCodeResult = await fetchSessionCode({
    client,
    loginData,
    twoFactorAuthenticationData,
  })

  if (sessionCodeResult.invalidPassword) {
    return {
      client,
      state: STATE_INVALID_PASSWORD,
    }
  }

  const need2FA = sessionCodeResult.twoFactorToken !== undefined

  if (need2FA) {
    return {
      client,
      state: STATE_2FA_NEEDED,
      twoFactorToken: sessionCodeResult.twoFactorToken,
    }
  }

  const sessionCode = sessionCodeResult.session_code

  return {
    client: client,
    sessionCode: sessionCode,
    state: STATE_AUTHORIZE_NEEDED,
  }
}

export const authorizeClient = async ({client, sessionCode}) => {
  const {codeVerifier, codeChallenge} = await createPKCE()

  await client.authorize({
    sessionCode: sessionCode,
    pkceCodes: {
      codeVerifier,
      codeChallenge,
    },
  })

  await client.login()
  await saveClient(client)

  return {
    client: client,
    state: STATE_CONNECTED,
  }
}

/**
 * Create and return a couple of PKCE keys
 * To make the PKCE creation possible, a CryptoWebView must be present in the ReactNative component tree
 *
 * @returns {object} message result from the CryptoWebView's `computePKCE` method
 * throws
 */
const createPKCE = async () => {
  return await queryResultToCrypto('computePKCE')
}

/**
 * Fetch the session code from cozy-stack
 *
 * Errors are handled to detect when 2FA is needed and when password is invalid
 *
 * @param {object} param
 * @param {object} param.client
 * @param {object} param.loginData
 * @param {object} [param.twoFactorAuthenticationData]
 * @returns {SessionCodeResult} The query result with session_code, or 2FA token, or invalid password error
 * @throws
 */
const fetchSessionCode = async ({
  client,
  loginData,
  twoFactorAuthenticationData = undefined,
}) => {
  const stackClient = client.getStackClient()

  try {
    const sessionCodeResult = await stackClient.fetchSessionCodeWithPassword({
      passwordHash: loginData.passwordHash,
      twoFactorToken: twoFactorAuthenticationData
        ? twoFactorAuthenticationData.token
        : undefined,
      twoFactorPasscode: twoFactorAuthenticationData
        ? twoFactorAuthenticationData.passcode
        : undefined,
    })

    return sessionCodeResult
  } catch (e) {
    if (e.status === 403 && e.reason && e.reason.two_factor_token) {
      return {
        twoFactorToken: e.reason.two_factor_token,
      }
    } else if (e.status === 401) {
      return {
        invalidPassword: true,
      }
    } else {
      throw e
    }
  }
}

/**
 * Retrieve the public data from the Cozy's instance
 *
 * This includes:
 * - user name needed for the password view
 * - the number of KDF iterations that should be applied to the user's password
 * in order to derivate encryption keys
 *
 * @param {CozyClient} client - CozyClient instance
 * @returns {CozyPublicData}
 */
export const fetchPublicData = async client => {
  const stackClient = client.getStackClient()

  const result = await stackClient.fetchJSON('GET', '/public/prelogin')

  return {
    kdfIterations: result.KdfIterations,
    name: result.name,
  }
}
