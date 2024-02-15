import { normalizeFqdn } from '/libs/functions/stringHelpers'
import {
  DevicePersistedStorageKeys,
  getData,
  storeData
} from '/libs/localStore/storage'

/**
 * Get the cozy-app configuration for specified FQFN and slug
 *
 * The configuration contains the current app version and folder
 *
 * @param {string} fqdn - FQDN from the cozy serving the cozy-app
 * @param {string} slug - the cozy-app's slug
 * @returns {Promise<CozyAppConfiguration | undefined>} - the configuration for the cozy-app
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
  const appConfiguration = await getData(DevicePersistedStorageKeys.Bundle)

  if (!appConfiguration) {
    return {}
  }

  return appConfiguration
}

const saveAppConfiguration = appConfiguration => {
  return storeData(DevicePersistedStorageKeys.Bundle, appConfiguration)
}
