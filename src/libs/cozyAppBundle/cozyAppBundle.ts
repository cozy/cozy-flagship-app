import Gzip from '@fengweichong/react-native-gzip'
import RNFS from 'react-native-fs'

import { logger } from '/libs/functions/logger'
import {
  fetchCozyAppArchiveInfoForVersion,
  fetchCozyAppStackInfos,
  getInstanceAndFqdnFromClient
} from '/libs/client'
import { getBaseFolderForFqdnAndSlug } from '/libs/httpserver/httpPaths'
import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from '/libs/cozyAppBundle/cozyAppBundleConfiguration'

import CozyClient from 'cozy-client'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import {
  getVersionsToKeep,
  handleCleanup
} from '/libs/cozyAppBundle/cozyAppBundle.functions'

export const log = logger('AppBundle')

const BUNDLE_UPDATE_DELAY_IN_MS = 10000

export type AppType = 'konnectors' | 'apps'

export interface AppInfo {
  client: CozyClient
  slug: string
}

/**
 * After the specified delay, check the cozy-app version on cozy-stack and
 * update the local CozyAppBundle if necessary
 *
 * This method should run in background and cannot be awaited
 */
export const updateCozyAppBundleInBackground = ({
  client,
  delayInMs = BUNDLE_UPDATE_DELAY_IN_MS,
  slug
}: AppInfo & {
  delayInMs?: number
}): Promise<void> =>
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
 */
export const updateCozyAppBundle = async ({
  client,
  slug,
  type = 'apps'
}: AppInfo & {
  type?: AppType
}): Promise<void> => {
  log.debug(`Check updates for '${slug}'`)
  const { fqdn } = getInstanceAndFqdnFromClient(client)

  const { version: currentVersion } =
    (await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)) ?? {}
  const { stackVersion, stackSource } = await fetchCozyAppStackInfos(
    slug,
    client,
    type
  )

  const destinationPath = getCozyAppFolderPathForVersion({
    client,
    slug,
    version: stackVersion
  })

  log.debug(
    `Current local version for ${slug} is '${
      currentVersion ?? 'unknown'
    }', stack version is '${stackVersion}'`
  )
  log.debug(`Current path for ${slug} is ${destinationPath}`)
  if (currentVersion === stackVersion) {
    log.debug(`Nothing to update`)
    return
  }

  const { tarPrefix } = await fetchCozyAppArchiveInfoForVersion(
    slug,
    stackVersion,
    client
  )

  await deleteVersionBundleFromLocalFilesIfExists({
    client,
    slug,
    tarPrefix: tarPrefix,
    version: stackVersion
  })

  await downloadAndExtractCozyAppVersion({
    client,
    destinationPath,
    slug,
    type,
    version: stackVersion,
    source: stackSource
  })

  await setCurrentAppVersionForFqdnAndSlug({
    folder: stackVersion + tarPrefix,
    fqdn,
    slug,
    version: stackVersion
  })

  await handleCleanup({
    client,
    slug,
    versionsToKeep: getVersionsToKeep({ type, currentVersion, stackVersion })
  })
}

const deleteVersionBundleFromLocalFilesIfExists = async ({
  client,
  slug,
  tarPrefix,
  version
}: AppInfo & { tarPrefix: string; version: string }): Promise<void> => {
  log.debug(`Check if local '${slug}' bundle version exist for '${version}'`)

  const expectedVersionPath = getCozyAppFolderPathForVersion({
    client,
    slug,
    version
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

const getCozyAppFolderPathForVersion = ({
  client,
  slug,
  version
}: AppInfo & { version: string }): string => {
  const { fqdn } = getInstanceAndFqdnFromClient(client)

  const baseFolderForFqdnAndSlug = getBaseFolderForFqdnAndSlug(fqdn, slug)

  return `${baseFolderForFqdnAndSlug}/${version}`
}

const getCozyAppArchivePathForVersion = ({
  client,
  slug,
  version
}: AppInfo & { version: string }): string => {
  const { fqdn } = getInstanceAndFqdnFromClient(client)

  const baseFolderForFqdnAndSlug = getBaseFolderForFqdnAndSlug(fqdn, slug)

  return `${baseFolderForFqdnAndSlug}/${version}.tar.gz`
}

const downloadAndExtractCozyAppVersion = async ({
  client,
  destinationPath,
  slug,
  type,
  version,
  source
}: AppInfo & {
  destinationPath: string
  type: AppType
  version: string
  source: string
}): Promise<void> => {
  log.debug(`Downloading '${slug}' version '${version}' from stack`)

  const archivePath = getCozyAppArchivePathForVersion({
    client,
    slug,
    version
  })
  await RNFS.mkdir(destinationPath)
  await downloadCozyAppArchive({
    client,
    destinationPath: archivePath,
    slug,
    type,
    version
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
  client,
  destinationPath,
  slug,
  type,
  version
}: AppInfo & {
  destinationPath: string
  type: AppType
  version: string
}): Promise<void> => {
  const stackClient = client.getStackClient()
  const headers = stackClient.getAuthorizationHeader()
  const instanceUri = stackClient.uri
  const downloadUri = new URL(instanceUri)
  downloadUri.pathname = `${type}/${slug}/download/${version}`

  try {
    const result = await RNFS.downloadFile({
      fromUrl: downloadUri.toString(),
      toFile: destinationPath,
      headers: {
        Authorization: headers
      }
    }).promise

    log.debug(`Download result is ${JSON.stringify(result)}`)

    const { statusCode } = result

    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(`Status code: ${statusCode}`)
    }
  } catch (err) {
    log.error(`Error while downloading archive: ${getErrorMessage(err)}`)
    throw err
  }
}
