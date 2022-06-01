import Gzip from '@fengweichong/react-native-gzip'
import RNFS from 'react-native-fs'
import Minilog from '@cozy/minilog'

import { fetchCozyAppVersion, getFqdnFromClient } from '../client'
import { getBaseFolderForFqdnAndSlug } from '../httpserver/httpPaths'
import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from './cozyAppBundleConfiguration'

const log = Minilog('AppBundle')

const BUNDLE_UPDATE_DELAY_IN_MS = 10000

/**
 * After the specified delay, check the cozy-app version on cozy-stack and
 * update the local CozyAppBundle if necessary
 *
 * This method should run in background and cannot be awaited
 *
 * @param {object} param
 * @param {string} param.slug - The slug of the cozy-app to update
 * @param {CozyClient} param.client - CozyClient instance
 * @param {number} [param.delayInMs] - Duration in millisecond to wait before doing the update (default=BUNDLE_UPDATE_DELAY_IN_MS)
 * @returns {Promise}
 */
export const updateCozyAppBundleInBackground = async ({
  slug,
  client,
  delayInMs = BUNDLE_UPDATE_DELAY_IN_MS
}) => {
  setTimeout(() => {
    updateCozyAppBundle({ slug, client })
  }, delayInMs)
}

/**
 * Check the cozy-app version on cozy-stack and update the local CozyAppBundle
 * if necessary
 *
 * @param {object} param
 * @param {string} param.slug - The slug of the cozy-app to update
 * @param {CozyClient} param.client - CozyClient instance
 * @returns {Promise}
 */
export const updateCozyAppBundle = async ({ slug, client }) => {
  log.debug(`Check updates for '${slug}'`)
  const { fqdn } = getFqdnFromClient(client)

  const { version: currentVersion } =
    (await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)) || {}
  const stackVersion = await fetchCozyAppVersion(slug, client)

  log.debug(
    `Current local version is '${currentVersion}', stack version is '${stackVersion}'`
  )

  if (currentVersion === stackVersion) {
    log.debug(`Nothing to update`)
    return
  }

  const destinationPath = await getCozyAppFolderPathForVersion({
    slug,
    version: stackVersion,
    client
  })

  if (
    await doesVersionBundleExistInLocalFiles({
      slug,
      version: stackVersion,
      client
    })
  ) {
    log.debug(
      `Local '${slug}' bundle for version '${stackVersion}' already existing, skipping download`
    )
  } else {
    await downloadAndExtractCozyAppVersion({
      slug,
      version: stackVersion,
      destinationPath,
      client
    })
  }

  setCurrentAppVersionForFqdnAndSlug({
    fqdn,
    slug,
    version: stackVersion,
    folder: normalizeVersion(stackVersion)
  })
}

const doesVersionBundleExistInLocalFiles = async ({
  slug,
  version,
  client
}) => {
  log.debug(`Check if local '${slug}' bundle version exist for '${version}'`)

  const expectedVersionPath = await getCozyAppFolderPathForVersion({
    slug,
    version,
    client
  })

  const expectedManifestPath = `${expectedVersionPath}/manifest.webapp`

  return await RNFS.exists(expectedManifestPath)
}

const normalizeVersion = version => {
  return version
}

const getCozyAppFolderPathForVersion = async ({ slug, version, client }) => {
  const { fqdn } = getFqdnFromClient(client)

  const baseFolderForFqdnAndSlug = await getBaseFolderForFqdnAndSlug(fqdn, slug)
  const normalizedVersion = normalizeVersion(version)

  return `${baseFolderForFqdnAndSlug}/${normalizedVersion}`
}

const getCozyAppArchivePathForVersion = async ({ slug, version, client }) => {
  const { fqdn } = getFqdnFromClient(client)

  const baseFolderForFqdnAndSlug = await getBaseFolderForFqdnAndSlug(fqdn, slug)
  const normalizedVersion = normalizeVersion(version)

  return `${baseFolderForFqdnAndSlug}/${normalizedVersion}.tar.gz`
}

const downloadAndExtractCozyAppVersion = async ({
  slug,
  version,
  destinationPath,
  client
}) => {
  log.debug(`Downloading '${slug}' version '${version}' from stack`)

  const archivePath = await getCozyAppArchivePathForVersion({
    slug,
    version,
    client
  })
  await RNFS.mkdir(destinationPath)
  await downloadCozyAppArchive({
    slug,
    version,
    destinationPath: archivePath,
    client
  })

  await extractCozyAppArchive(archivePath, destinationPath)

  await removeCozyAppArchive(archivePath)
}

const extractCozyAppArchive = async (archivePath, destinationPath) => {
  try {
    const dest = `${destinationPath}/unzip`
    await RNFS.mkdir(dest)

    await Gzip.unGzipTar(archivePath, destinationPath, true)
  } catch (err) {
    log.error(`Error whild extracting archive: ${err.message}`)
    throw err
  }
}

const removeCozyAppArchive = async archivePath => {
  await RNFS.unlink(archivePath)
}

const downloadCozyAppArchive = async ({
  slug,
  version,
  destinationPath,
  client
}) => {
  const stackClient = client.getStackClient()
  const headers = stackClient.getAuthorizationHeader()
  const instanceUri = stackClient.uri
  const downloadUri = new URL(instanceUri)
  downloadUri.pathname = `apps/${slug}/download/${version}`

  try {
    const result = await RNFS.downloadFile({
      fromUrl: downloadUri.toString(),
      toFile: destinationPath,
      // discretionary: true,
      headers: {
        Authorization: headers
      }
    }).promise

    log.debug(`Donload result is ${JSON.stringify(result)}`)
  } catch (err) {
    log.error(`Error whild downloading archive: ${err.message}`)
    throw err
  }
}
