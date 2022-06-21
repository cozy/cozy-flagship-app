import RNFS from 'react-native-fs'
import Minilog from '@cozy/minilog'

import {
  getBaseFolderForFqdnAndSlug,
  getBaseFolderForFqdnAndSlugAndCurrentVersion,
  getBaseRelativePathForFqdnAndSlugAndCurrentVersion
} from './httpPaths'
import { getAssetVersion, prepareAssets } from './copyAllFilesFromBundleAssets'
import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from '../cozyAppBundle/cozyAppBundleConfiguration'
import { replaceAll } from '../functions/stringHelpers'
import { localConfig } from '/config/local'

const log = Minilog('IndexGenerator')

const initLocalBundleIfNotExist = async (fqdn, slug) => {
  if (slug !== 'home') {
    return
  }

  const basePath = await getBaseFolderForFqdnAndSlug(fqdn, slug)

  const embeddedBundlePath = `${basePath}/embedded`

  const manifestPath = `${embeddedBundlePath}/manifest.webapp`

  const embeddedExists = await RNFS.exists(manifestPath)

  if (!embeddedExists) {
    log.debug(`No local assets found, extrating bundled asset`)
    await prepareAssets(embeddedBundlePath)

    const version = await getAssetVersion()

    await setCurrentAppVersionForFqdnAndSlug({
      fqdn,
      slug,
      version,
      folder: 'embedded'
    })
  }
}

export const getIndexForFqdnAndSlug = async (fqdn, slug) => {
  if (localConfig.disableGetIndex) return false // Make cozy-app hosted by webpack-dev-server work with HTTPServer

  await initLocalBundleIfNotExist(fqdn, slug)

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

  const indexPath = basePath + '/index.html'

  const fileContent = await RNFS.readFile(indexPath)

  return fileContent
}

export const fillIndexWithData = async ({
  fqdn,
  slug,
  port,
  securityKey,
  indexContent,
  indexData
}) => {
  let output = indexContent

  const basePath = await getBaseRelativePathForFqdnAndSlugAndCurrentVersion(
    fqdn,
    slug
  )

  const absoluteUrlBasePath = `http://localhost:${port}/${securityKey}${basePath}`
  output = replaceRelativeUrlsWithAbsoluteUrls(output, absoluteUrlBasePath)
  output = replaceProtocolRelativeUrlsWithAbsoluteUrls(
    output,
    absoluteUrlBasePath
  )

  Object.entries(indexData).forEach(([key, value]) => {
    output = replaceAll(output, `{{.${key}}}`, value)
  })

  return output
}

const replaceRelativeUrlsWithAbsoluteUrls = (str, absoluteUrlBasePath) => {
  return str
    .replace(/href="\/(?!\/)/g, `href="${absoluteUrlBasePath}/`)
    .replace(/src="\/(?!\/)/g, `src="${absoluteUrlBasePath}/`)
}

const replaceProtocolRelativeUrlsWithAbsoluteUrls = (
  str,
  absoluteUrlBasePath
) => {
  return str
    .replace(/href="(?!http|\/\/)/g, `href="${absoluteUrlBasePath}/`)
    .replace(/src="(?!http|\/\/)/g, `src="${absoluteUrlBasePath}/`)
}
