import RNFS from 'react-native-fs'

import { getErrorMessage } from 'cozy-intent'
import Minilog from 'cozy-minilog'

import { getCurrentAppConfigurationForFqdnAndSlug } from '/libs/cozyAppBundle/cozyAppBundleConfiguration'
import { getBaseFolderForFqdnAndSlugAndCurrentVersion } from '/libs/httpserver/httpPaths'

export const log = Minilog('IsOfflineCompatible')

export const isOfflineCompatible = async (
  fqdn: string,
  slug: string
): Promise<boolean> => {
  return false

  try {
    const appConfiguration = await getCurrentAppConfigurationForFqdnAndSlug(
      fqdn,
      slug
    )

    if (!appConfiguration) {
      return false
    }

    const basePath = await getBaseFolderForFqdnAndSlugAndCurrentVersion(
      fqdn,
      slug
    )

    const manifestPath = basePath + '/manifest.webapp'

    if (!(await RNFS.exists(manifestPath))) {
      return false
    }

    const fileContent = await RNFS.readFile(manifestPath)

    const manifest = JSON.parse(fileContent) as Record<string, unknown>

    return manifest.offline_support === true
  } catch (error) {
    log.error(
      `Could not read manifest for app "${slug}": ${getErrorMessage(error)}.`
    )

    return false
  }
}
