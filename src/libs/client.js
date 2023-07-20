import Minilog from 'cozy-minilog'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import CozyClient from 'cozy-client'
// @ts-ignore
import flag from 'cozy-flags'

import { normalizeFqdn } from './functions/stringHelpers'

import strings from '/constants/strings.json'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import {
  listenTokenRefresh,
  saveClient
} from '/libs/clientHelpers/persistClient'
import { changeLanguage } from '/locales/i18n'

import packageJSON from '../../package.json'

export {
  callMagicLinkOnboardingInitClient,
  connectMagicLinkClient
} from '/libs/clientHelpers/magicLink'
export { authorizeClientAndLogin } from '/libs/clientHelpers/authorizeClient'
export { connectOidcClient } from '/libs/clientHelpers/oidc'
export { clearClient } from '/libs/clientHelpers/persistClient'
export { createClient } from '/libs/clientHelpers/createClient'
export {
  callInitClient,
  callOnboardingInitClient
} from '/libs/clientHelpers/initClient'
export { call2FAInitClient } from '/libs/clientHelpers/twoFactorAuthentication'

const log = Minilog('LoginScreen')

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

  await client.registerPlugin(flag.plugin)
  await client.plugins.flags.initializing
  await changeLanguage(client.getInstanceOptions().locale)

  return client
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

/**
 * @typedef {Object} getInstanceAndFqdnFromClient
 * @property {string} fqdn - The fqdn is the raw host of the cozy instance (usually you don't want to use it)
 * @property {string} normalizedFqdn - The normalizedFqdn is the fqdn with special characters replaced by underscores
 * @property {string} uri - The uri is the root url of the cozy instance
 */

/**
 * @param {CozyClient} client - CozyClient instance
 * 
 * @description  Get The uri, fqdn and normalizedFqdn of a cozy instance
 *
 * @returns {getInstanceAndFqdnFromClient}

 * @example
 * const { uri, fqdn, normalizedFqdn } = await getInstanceAndFqdnFromClient(client)
 * // uri: https://cozy.tools:8080
 * // fqdn: cozy.tools:8080
 * // normalizedFqdn: cozy.tools_8080
 */
export const getInstanceAndFqdnFromClient = client => {
  const rootURL = client.getStackClient().uri
  const { host: fqdn } = new URL(rootURL)

  const normalizedFqdn = normalizeFqdn(fqdn)

  return {
    fqdn,
    normalizedFqdn,
    uri: rootURL
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
