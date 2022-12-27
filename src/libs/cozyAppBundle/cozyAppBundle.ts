import Gzip from '@fengweichong/react-native-gzip'
import RNFS from 'react-native-fs'
import { logger } from '/libs/functions/logger'

import {
  fetchCozyAppArchiveInfoForVersion,
  fetchCozyAppVersion,
  getFqdnFromClient
} from '../client'
import { getBaseFolderForFqdnAndSlug } from '../httpserver/httpPaths'
import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from './cozyAppBundleConfiguration'
import CozyClient from 'cozy-client'
import { getErrorMessage } from '../functions/getErrorMessage'

const log = logger('AppBundle')

const BUNDLE_UPDATE_DELAY_IN_MS = 10000

interface AppInfo {
  slug: string
  client: CozyClient
}

interface CozyAppToUpdate extends AppInfo {
  delayInMs?: number
}

interface CozyAppWithVer extends AppInfo {
  version: string
}

interface CozyAppWithDest extends CozyAppWithVer {
  destinationPath: string
}

interface CozyAppWithPrefix extends CozyAppWithVer {
  tarPrefix: string
}

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
export const updateCozyAppBundleInBackground = ({
  slug,
  client,
  delayInMs = BUNDLE_UPDATE_DELAY_IN_MS
}: CozyAppToUpdate): Promise<void> =>
  new Promise(resolve => {
    setTimeout(() => {
      updateCozyAppBundle({ slug, client })
        .then(resolve)
        .catch(err =>
          log.error(
            `Something went wront while updating ${slug} bundle: ${getErrorMessage(
              err
            )}`,
            resolve()
          )
        )
    }, delayInMs)
  })

/**
 * Check the cozy-app version on cozy-stack and update the local CozyAppBundle
 * if necessary
 *
 * @param {object} param
 * @param {string} param.slug - The slug of the cozy-app to update
 * @param {CozyClient} param.client - CozyClient instance
 * @returns {Promise}
 */
export const updateCozyAppBundle = async ({
  slug,
  client
}: CozyAppToUpdate): Promise<void> => {
  log.debug(`Check updates for '${slug}'`)
  const { fqdn } = getFqdnFromClient(client)

  const { version: currentVersion } =
    (await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)) ?? {}
  const stackVersion = await fetchCozyAppVersion(slug, client)

  log.debug(
    `Current local version is '${
      currentVersion ?? 'unknown'
    }', stack version is '${stackVersion}'`
  )

  if (currentVersion === stackVersion) {
    log.debug(`Nothing to update`)
    return
  }

  const { tarPrefix } = await fetchCozyAppArchiveInfoForVersion(
    slug,
    stackVersion,
    client
  )

  const destinationPath = await getCozyAppFolderPathForVersion({
    slug,
    version: stackVersion,
    client
  })

  await deleteVersionBundleFromLocalFilesIfExists({
    slug,
    version: stackVersion,
    tarPrefix: tarPrefix,
    client
  })

  await downloadAndExtractCozyAppVersion({
    slug,
    version: stackVersion,
    destinationPath,
    client
  })

  void setCurrentAppVersionForFqdnAndSlug({
    fqdn,
    slug,
    version: stackVersion,
    folder: normalizeVersion(stackVersion) + tarPrefix
  })
}

const deleteVersionBundleFromLocalFilesIfExists = async ({
  slug,
  version,
  tarPrefix,
  client
}: CozyAppWithPrefix): Promise<void> => {
  log.debug(`Check if local '${slug}' bundle version exist for '${version}'`)

  const expectedVersionPath = await getCozyAppFolderPathForVersion({
    slug,
    version,
    client
  })
  const expectedVersionPathWithTarPrefix = `${expectedVersionPath}${tarPrefix}`

  const doesFolderExists = await RNFS.exists(expectedVersionPathWithTarPrefix)
  if (doesFolderExists) {
    log.debug(
      `Local '${slug}' bundle for version '${version}' already existing, deleting existing folder before download`
    )
    await RNFS.unlink(expectedVersionPathWithTarPrefix)
  }
}

const normalizeVersion = (version: string): string => {
  return version
}

const getCozyAppFolderPathForVersion = async ({
  slug,
  version,
  client
}: CozyAppWithVer): Promise<string> => {
  const { fqdn } = getFqdnFromClient(client)

  const baseFolderForFqdnAndSlug = await getBaseFolderForFqdnAndSlug(fqdn, slug)
  const normalizedVersion = normalizeVersion(version)

  return `${baseFolderForFqdnAndSlug}/${normalizedVersion}`
}

const getCozyAppArchivePathForVersion = async ({
  slug,
  version,
  client
}: CozyAppWithVer): Promise<string> => {
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
}: CozyAppWithDest): Promise<void> => {
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

const extractCozyAppArchive = async (
  archivePath: string,
  destinationPath: string
): Promise<void> => {
  try {
    await RNFS.mkdir(destinationPath)

    await Gzip.unGzipTar(archivePath, destinationPath, true)
  } catch (err) {
    log.error(`Error while extracting archive: ${getErrorMessage(err)}`)
    throw err
  }
}

const removeCozyAppArchive = async (archivePath: string): Promise<void> => {
  await RNFS.unlink(archivePath)
}

const downloadCozyAppArchive = async ({
  slug,
  version,
  destinationPath,
  client
}: CozyAppWithDest): Promise<void> => {
  const stackClient = client.getStackClient() as {
    uri: string
    getAuthorizationHeader: () => string
  }
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

    const { statusCode } = result

    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(`Status code: ${statusCode}`)
    }
  } catch (err) {
    log.error(`Error while downloading archive: ${getErrorMessage(err)}`)
    throw err
  }
}
