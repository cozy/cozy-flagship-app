import AsyncStorage from '@react-native-async-storage/async-storage'

import { normalizeFqdn } from '/libs/functions/stringHelpers'

import strings from '/strings.json'

/**
 * Get the cozy-app configuration for specified FQFN and slug
 *
 * The configuration contains the current app version and folder
 *
 * @param {string} fqdn - FQDN from the cozy serving the cozy-app
 * @param {string} slug - the cozy-app's slug
 * @returns {CozyAppConfiguration} - the configuration for the cozy-app
 */
export const getCurrentAppConfigurationForFqdnAndSlug = async (fqdn, slug) => {
  const normalizedFqdn = normalizeFqdn(fqdn)

  const appConfiguration = await loadAppConfiguration()

  return appConfiguration?.[normalizedFqdn]?.[slug]
}

/**
 * Save the current configuration for the specified cozy-app
 *
 * @param {object} param
 * @param {string} param.fqdn - FQDN from the cozy serving the cozy-app
 * @param {string} param.slug - the cozy-app's slug
 * @param {string} param.version - the cozy-app's slug
 * @param {string} param.folder - the name of the folder where the assets for cozy-app are stored
 * @returns {Promise}
 */
export const setCurrentAppVersionForFqdnAndSlug = async ({
  fqdn,
  slug,
  version,
  folder
}) => {
  const normalizedFqdn = normalizeFqdn(fqdn)

  const appConfiguration = await loadAppConfiguration()

  appConfiguration[normalizedFqdn] = appConfiguration[normalizedFqdn] || {}
  const instanceConfiguration = appConfiguration[normalizedFqdn]

  instanceConfiguration[slug] = instanceConfiguration[slug] || {}
  const cozyAppConfiguration = instanceConfiguration[slug]

  cozyAppConfiguration.version = version
  cozyAppConfiguration.folderName = folder

  return saveAppConfiguration(appConfiguration)
}

const loadAppConfiguration = async () => {
  const state = await AsyncStorage.getItem(strings.BUNDLE_STORAGE_KEY)

  if (!state) {
    return {}
  }

  const appConfiguration = JSON.parse(state)

  return appConfiguration
}

const saveAppConfiguration = appConfiguration => {
  const state = JSON.stringify(appConfiguration)
  return AsyncStorage.setItem(strings.BUNDLE_STORAGE_KEY, state)
}
