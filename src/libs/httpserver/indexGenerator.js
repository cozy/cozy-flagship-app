import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import Minilog from 'cozy-minilog'

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

import { shouldDisableGetIndex } from '/core/tools/env'

const log = Minilog('IndexGenerator')

// The slug's allowlist should be used to list apps
// that are proven to work correctly when injected using HttpServer
// If not present in this list, then slug will be served from cozy-stack
// We also choose to add a blocklist but use it as a last resort
// Current known bugs are:
// - mespapiers cannot be injected until we fix window.history bug on iOS
// - drive cannot be injected until we fix window.history bug on iOS (bug in OnlyOffice)
// - settings cannot be injected until we modernize it by doing all queries through
//   cozy-client and correctly handle `https` override with `isSecureProtocol` parameter
// - cozy-pass-web cannot be injected because fetch with { mode: 'no-cors' } does not work
const slugAllowList = [
  { platform: 'ALL', slug: 'home' },
  { platform: 'android', slug: 'ALL' }
]

const slugBlockList = [{ platform: 'ALL', slug: 'passwords' }]

const initLocalBundleIfNotExist = async (fqdn, slug) => {
  if (slug !== 'home') {
    return
  }

  const basePath = getBaseFolderForFqdnAndSlug(fqdn, slug)

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

const isSlugInAllowlist = currentSlug =>
  slugAllowList.some(
    ({ slug, platform }) =>
      (slug === 'ALL' && platform === Platform.OS) ||
      (slug === currentSlug && platform === 'ALL') ||
      (slug === currentSlug && platform === Platform.OS)
  )

const isSlugInBlocklist = currentSlug =>
  slugBlockList.some(
    ({ slug, platform }) =>
      (slug === currentSlug && platform === 'ALL') ||
      (slug === currentSlug && platform === Platform.OS)
  )

export const getIndexForFqdnAndSlug = async (fqdn, slug) => {
  if (shouldDisableGetIndex()) return false // Make cozy-app hosted by webpack-dev-server work with HTTPServer

  if (!isSlugInAllowlist(slug) || isSlugInBlocklist(slug)) return false

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
