import RNFS from 'react-native-fs'

/**
 * Define iOS path and android path used by http server as root folder
 *
 * @returns {string}
 */
export const getServerBaseFolder = () => {
  return RNFS.DocumentDirectoryPath
}

/**
 * Get the relative path where the specified cozy-app is stored
 * A cozy-app is characterized by its slug and the FQDN from its cozy
 *
 * The returned path is relative to the server's base folder
 * It can be used as a relative path to query files from the device's file system
 * or as an URL path when querying the local HttpServer
 *
 * @param {string} fqdn - FQDN from the cozy serving the cozy-app
 * @param {string} slug - the cozy-app's slug
 * @returns {string}
 */
export const getBaseRelativePathForFqdnAndSlug = (fqdn, slug) => {
  const normalizedFqdn = fqdn.replace(':', '_')
  if (slug === 'home') {
    return `/${normalizedFqdn}/home/embedded`
  }
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
export const getBaseFolderForFqdnAndSlug = (fqdn, slug) => {
  const serverBasePath = getServerBaseFolder()

  const basePathForFqdnAndSlug = `${serverBasePath}${getBaseRelativePathForFqdnAndSlug(
    fqdn,
    slug
  )}`

  return basePathForFqdnAndSlug
}
