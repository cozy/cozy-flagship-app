import RNFS from 'react-native-fs'

import { getCurrentAppConfigurationForFqdnAndSlug } from '../cozyAppBundle/cozyAppBundleConfiguration'

import { normalizeFqdn } from '/libs/functions/stringHelpers'

/**
 * Define iOS path and android path used by http server as root folder
 *
 * @returns {string}
 */
export const getServerBaseFolder = (): string => {
  return RNFS.DocumentDirectoryPath
}

/**
 * Get the relative path where the specified cozy-app is stored
 * A cozy-app is characterized by its slug and the FQDN from its cozy
 *
 * The returned path is relative to the server's base folder
 * It can be used as a relative path to locate all versions of the
 * specified cozy-app
 *
 * @param {string} fqdn - FQDN from the cozy serving the cozy-app
 * @param {string} slug - the cozy-app's slug
 * @returns {string}
 */
export const getBaseRelativePathForFqdnAndSlug = (
  fqdn: string,
  slug: string
): string => {
  const normalizedFqdn = normalizeFqdn(fqdn)

  return `/${normalizedFqdn}/${slug}`
}

/**
 * Get the relative path where the latest version of specified cozy-app is stored
 * A cozy-app is characterized by its slug and the FQDN from its cozy
 *
 * The returned path is relative to the server's base folder
 * It can be used as a relative path to query files from the device's file system
 * or as an URL path when querying the local HttpServer
 *
 * @param {*} fqdn - FQDN from the cozy serving the cozy-app
 * @param {*} slug - the cozy-app's slug
 * @returns {Promise<string>}
 */
export const getBaseRelativePathForFqdnAndSlugAndCurrentVersion = async (
  fqdn: string,
  slug: string
): Promise<string> => {
  const normalizedFqdn = normalizeFqdn(fqdn)

  const appConfiguration = await getCurrentAppConfigurationForFqdnAndSlug(
    fqdn,
    slug
  )

  const folder = appConfiguration?.folderName || 'embedded'

  return `/${normalizedFqdn}/${slug}/${folder}`
}

/**
 * Get the path of the folder that contains the latest version of specified
 * cozy-app
 * A cozy-app is characterized by its slug and the FQDN from its cozy
 *
 * The returned path is an absolute path on the device's file system
 *
 * @param {string} fqdn - FQDN from the cozy serving the cozy-app
 * @param {string} slug - the cozy-app's slug
 * @returns {Promise<string>}
 */
export const getBaseFolderForFqdnAndSlugAndCurrentVersion = async (
  fqdn: string,
  slug: string
): Promise<string> => {
  const serverBasePath = getServerBaseFolder()

  const baseRelativePathForFqdnAndSlug =
    await getBaseRelativePathForFqdnAndSlugAndCurrentVersion(fqdn, slug)

  const basePathForFqdnAndSlug = `${serverBasePath}${baseRelativePathForFqdnAndSlug}`

  return basePathForFqdnAndSlug
}

/**
 * Get the path of the folder that contains the specified cozy-app
 * A cozy-app is characterized by its slug and the FQDN from its cozy
 *
 * The returned path is an absolute path on the device's file system
 *
 * @param {string} fqdn - FQDN from the cozy serving the cozy-app
 * @param {string} slug - the cozy-app's slug
 * @returns {string}
 */
export const getBaseFolderForFqdnAndSlug = (
  fqdn: string,
  slug: string
): string => {
  const serverBasePath = getServerBaseFolder()

  const baseRelativePathForFqdnAndSlug = getBaseRelativePathForFqdnAndSlug(
    fqdn,
    slug
  )

  const basePathForFqdnAndSlug = `${serverBasePath}${baseRelativePathForFqdnAndSlug}`

  return basePathForFqdnAndSlug
}
