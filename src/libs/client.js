import Minilog from '@cozy/minilog'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import CozyClient from 'cozy-client'

import { loginFlagship } from './clientHelpers/loginFlagship'
import { normalizeFqdn } from './functions/stringHelpers'

import strings from '/constants/strings.json'
import { createPKCE } from '/libs/clientHelpers/authorizeClient'
import { createClient } from '/libs/clientHelpers/createClient'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import {
  listenTokenRefresh,
  saveClient
} from '/libs/clientHelpers/persistClient'

import packageJSON from '../../package.json'

export {
  callMagicLinkOnboardingInitClient,
  connectMagicLinkClient
} from '/libs/clientHelpers/magicLink'
export { connectOidcClient } from '/libs/clientHelpers/oidc'
export { clearClient } from '/libs/clientHelpers/persistClient'
export { createClient } from '/libs/clientHelpers/createClient'

const log = Minilog('LoginScreen')

export const STATE_CONNECTED = 'STATE_CONNECTED'
export const STATE_AUTHORIZE_NEEDED = 'STATE_AUTHORIZE_NEEDED'
export const STATE_2FA_NEEDED = 'STATE_2FA_NEEDED'
export const STATE_INVALID_PASSWORD = 'STATE_INVALID_PASSWORD'

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
  const { uri, oauthOptions, token } = state
  const client = new CozyClient({
    uri,
    oauth: { token },
    oauthOptions,
    appMetadata: {
      slug: 'flagship',
      version: packageJSON.version
    }
  })
  listenTokenRefresh(client)
  client.getStackClient().setOAuthOptions(oauthOptions)
  await client.login({
    uri,
    token
  })
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
  client: clientParam
}) => {
  const client = clientParam || (await createClient(instance))

  return await connectClient({
    loginData,
    client
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
  twoFactorAuthenticationData
}) => {
  return await connectClient({
    loginData,
    client,
    twoFactorAuthenticationData
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
  registerToken
}) => {
  const client = await createClient(instance)
  const stackClient = client.getStackClient()

  await client.certifyFlagship()

  const { passwordHash, hint, iterations, key, publicKey, privateKey } =
    loginData

  const result = await stackClient.setPassphraseFlagship({
    registerToken,
    passwordHash,
    hint,
    iterations,
    key,
    publicKey,
    privateKey
  })

  if (result.access_token) {
    stackClient.setToken(result)
  } else if (result.session_code) {
    const { session_code } = result
    const { codeVerifier, codeChallenge } = await createPKCE()

    await client.authorize({
      sessionCode: session_code,
      pkceCodes: {
        codeVerifier,
        codeChallenge
      }
    })
  }

  await client.login()
  await saveClient(client)
  listenTokenRefresh(client)

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
  twoFactorAuthenticationData = undefined
}) => {
  const {
    two_factor_token: twoFactorToken,
    session_code: sessionCode,
    invalidPassword,
    ...token
  } = await loginFlagship({
    client,
    loginData,
    twoFactorAuthenticationData
  })

  if (invalidPassword) {
    return {
      client,
      state: STATE_INVALID_PASSWORD
    }
  }

  const need2FA = twoFactorToken !== undefined

  if (need2FA) {
    return {
      client,
      state: STATE_2FA_NEEDED,
      twoFactorToken: twoFactorToken
    }
  }

  const needFlagshipVerification = sessionCode !== undefined

  if (needFlagshipVerification) {
    return {
      client: client,
      state: STATE_AUTHORIZE_NEEDED,
      sessionCode: sessionCode
    }
  }

  const stackClient = client.getStackClient()
  stackClient.setToken(token)

  await client.login()
  await saveClient(client)
  listenTokenRefresh(client)

  return {
    client: client,
    state: STATE_CONNECTED
  }
}

export const authorizeClient = async ({ client, sessionCode }) => {
  const { codeVerifier, codeChallenge } = await createPKCE()

  await client.authorize({
    sessionCode: sessionCode,
    pkceCodes: {
      codeVerifier,
      codeChallenge
    }
  })

  await client.login()
  await saveClient(client)
  listenTokenRefresh(client)

  return {
    client: client,
    state: STATE_CONNECTED
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

  const { KdfIterations: kdfIterations, name } = await stackClient.fetchJSON(
    'GET',
    '/public/prelogin'
  )

  return {
    kdfIterations,
    name
  }
}

/**
 * Fetches the data that is used to display a cozy application.
 *
 * @template T - The type of the application data
 * @param {string} slug - The application slug
 * @param {object} client - A CozyClient instance
 * @param {object} [cookie] - An object containing a name and value property
 * @returns {Promise<T>} - The application data
 */

export const fetchCozyDataForSlug = async (slug, client, cookie) => {
  const stackClient = client.getStackClient()

  const options = cookie
    ? {
        // credentials:omit is necessary here to prevent cookie duplication in the fetch call
        // more info: https://github.com/facebook/react-native/issues/23185#issuecomment-536420223
        credentials: 'omit',
        headers: {
          Cookie: `${cookie.name}=${cookie.value}`
        }
      }
    : undefined

  const result = await stackClient.fetchJSON(
    'GET',
    `/apps/${slug}/open`,
    undefined,
    options
  )

  return result
}

export const getFqdnFromClient = client => {
  const rootURL = client.getStackClient().uri
  const { host: fqdn } = new URL(rootURL)

  const normalizedFqdn = normalizeFqdn(fqdn)

  return {
    fqdn,
    normalizedFqdn
  }
}

/**
 * @param {string} slug - The slug of the cozy-app to update
 * @param {CozyClient} client - CozyClient instance
 * @returns {Promise<string>} - The version of the cozy-app
 */
export const fetchCozyAppVersion = async (slug, client, type = 'apps') => {
  const stackClient = client.getStackClient()

  const result = await stackClient.fetchJSON('GET', `/${type}/${slug}`)

  const version = result?.data?.attributes?.version

  if (!version) {
    throw new Error(`No version found for app ${slug}`)
  }

  return version
}

const isClientErrorResponse = error =>
  Number.isInteger(error.status) && error.status.toString().startsWith('4')

/**
 * @param {string} slug - The slug of the cozy-app to update
 * @param {string} version - The version of the cozy-app to update
 * @param {CozyClient} client - CozyClient instance
 * @returns {Promise<{tarPrefix: string}>} - The version of the cozy-app
 */
export const fetchCozyAppArchiveInfoForVersion = async (
  slug,
  version,
  client
) => {
  const stackClient = client.getStackClient()

  try {
    const { tar_prefix } = await stackClient.fetchJSON(
      'GET',
      `/registry/${slug}/${version}`
    )

    return {
      tarPrefix: tar_prefix ?? ''
    }
  } catch (error) {
    if (isClientErrorResponse(error)) {
      log.warn(
        `Could not fetch tarPrefix for ${slug}@${version}. Using empty string instead.
        Is your konnector available in the registry?\n`,
        getErrorMessage(error)
      )

      return {
        tarPrefix: ''
      }
    } else throw error
  }
}

export const saveNotificationDeviceToken = async (client, token) => {
  const oauthOptions = client.getStackClient().oauthOptions

  if (oauthOptions?.notification_device_token === token) return

  await client.getStackClient().updateInformation({
    ...oauthOptions,
    notificationDeviceToken: token,
    notificationPlatform: Platform.OS
  })
  await saveClient(client)
}

export const removeNotificationDeviceToken = async client => {
  const oauthOptions = client.getStackClient().oauthOptions

  if (oauthOptions?.notification_device_token === '') return

  await client.getStackClient().updateInformation({
    ...oauthOptions,
    notificationDeviceToken: '',
    notificationPlatform: ''
  })

  await saveClient(client)
}
