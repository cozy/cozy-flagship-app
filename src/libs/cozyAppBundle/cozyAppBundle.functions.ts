import RNFS from 'react-native-fs'

import { AppInfo, AppType, log } from '/libs/cozyAppBundle/cozyAppBundle'
import {
  getBaseFolderForFqdnAndSlug,
  getBaseFolderForFqdnAndSlugAndCurrentVersion
} from '/libs/httpserver/httpPaths'
import { getFqdnFromClient } from '/libs/client'
import { getErrorMessage } from 'cozy-intent'

export interface KonnectorBundle {
  content: string
  manifest: Record<string, unknown>
}

/**
 * Returns the manifest and the content of the main.js file for a given konnector
 *
 * @param {AppInfo} appInfo - Information about the konnector to get the manifest and main.js file
 * @returns {KonnectorBundle} The manifest and main.js file for the konnector
 */
export const getKonnectorBundle = async ({
  client,
  slug
}: AppInfo): Promise<KonnectorBundle> => {
  const { fqdn } = getFqdnFromClient(client)
  const path = await getBaseFolderForFqdnAndSlugAndCurrentVersion(fqdn, slug)

  try {
    const manifest = JSON.parse(
      await RNFS.readFile(path + '/manifest.konnector')
    ) as Record<string, unknown>
    const content = await RNFS.readFile(path + '/main.js')

    return {
      manifest,
      content
    }
  } catch (error) {
    log.error(
      `Could not read manifest or main.js for konnector "${slug}" at path "${path}": ${getErrorMessage(
        error
      )}.`
    )

    throw error
  }
}

/**
 * Deletes all cache folders for the given slug that are not in the versionsToKeep array.
 *
 * @param client - The client that is being used
 * @param slug - The slug of the app/konnector that is being cleaned up
 * @param versionsToKeep - The list of versions that will not be deleted
 */
export const handleCleanup = async ({
  client,
  slug,
  versionsToKeep
}: AppInfo & { versionsToKeep: string[] }): Promise<void> => {
  const { fqdn } = getFqdnFromClient(client)
  const path = getBaseFolderForFqdnAndSlug(fqdn, slug)
  const dirs = (await RNFS.readDir(path)) as RNFS.ReadDirItem[] | undefined

  if (!dirs || dirs.length === 0)
    return log.warn(
      `Unexpected "${JSON.stringify(
        dirs
      )}" value when trying to read old cache for slug "${slug}" with versionsToKeep "${JSON.stringify(
        versionsToKeep
      )}", bailing out.`
    )

  for (const dir of dirs) {
    if (!versionsToKeep.includes(dir.name))
      await RNFS.unlink(`${path}/${dir.name}`)
  }
}

/**
 * Returns the list of versions to keep for this AppType.
 *
 * @param {string} options.type - type of the app
 * @param {string} options.currentVersion - current version of the app in the cache
 * @param {string} options.stackVersion - current version downloaded from the stack
 *
 * @returns {string[]}
 */
export const getVersionsToKeep = ({
  currentVersion,
  stackVersion,
  type
}: {
  currentVersion?: string
  stackVersion: string
  type: AppType
}): string[] => {
  // If the type is a konnector, we keep only the next version because the bundle is immediately updated
  if (type === 'konnectors' || !currentVersion) return [stackVersion]

  // If it's a webapp, we need to keep the current and the next versions because the bundle is updated only after a restart
  return [currentVersion, stackVersion]
}

/**
 * Returns the manifest and the content of the main.js file for a given connector
 * using the HTTP server
 * @param {string} url - The URL of the HTTP server
 * @returns {ConnectorBundle} The manifest and main.js file for the connector
 * @throws {Error} If the manifest or main.js file could not be fetched
 * @throws {Error} If the manifest or main.js file could not be parsed
 * @throws {Error} If the manifest or main.js file could not be read
 */
export const fetchKonnectorFromUrl = async (
  url: string
): Promise<KonnectorBundle> => {
  const manifest = await fetch(`${url}/manifest.konnector`)
  const content = await fetch(`${url}/main.js`)

  return {
    manifest: (await manifest.json()) as Record<string, unknown>,
    content: await content.text()
  }
}
