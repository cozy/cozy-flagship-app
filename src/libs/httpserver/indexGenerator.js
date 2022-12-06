import { Platform } from 'react-native'
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
import { devConfig } from '/config/dev'

const log = Minilog('IndexGenerator')

// The slug's blocklist should be use to prevent
// the list slugs to be injected using HttpServer
// Instead those slugs will be served from cozy-stack
const slugBlocklist = [
  // mespapiers cannot be injected until we fix window.history bug on iOS
  { platform: 'ios', slug: 'mespapiers' },

  // settings cannot be injected until we modernize it by doing all queries through
  // cozy-client and correctly handle `https` override with `isSecureProtocol` parameter
  { platform: 'ios', slug: 'settings' },

  // drive cannot be injected until we fix window.history bug on iOS (bug in OnlyOffice)
  { platform: 'ios', slug: 'drive' }
]

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

const isSlugInBlocklist = slug =>
  slugBlocklist.some(
    blocklistedSlug =>
      blocklistedSlug.slug === slug && blocklistedSlug.platform === Platform.OS
  )

export const getIndexForFqdnAndSlug = async (fqdn, slug) => {
  if (devConfig.disableGetIndex) return false // Make cozy-app hosted by webpack-dev-server work with HTTPServer

  if (isSlugInBlocklist(slug)) return false

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
