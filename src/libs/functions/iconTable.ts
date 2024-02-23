/* eslint-disable no-bitwise */
import CozyClient, { Q } from 'cozy-client'
import Minilog from 'cozy-minilog'

import strings from '/constants/strings.json'
import iconFallbackJson from '/assets/iconFallback.json'
import { clearClient } from '/libs/client'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import {
  getData,
  CozyPersistedStorageKeys,
  storeData,
  removeData
} from '/libs/localStore/storage'
import type { IconsCache } from '/libs/localStore/storage'
const log = Minilog('Icon Table')

type IconTable = Record<string, { version: string; xml: string } | undefined>

export let iconTable: IconTable = {}

const setIconTable = (table: IconsCache): void => {
  iconTable = table
}

export const getIconTable = (): IconTable => {
  return iconTable
}

export const TESTING_ONLY_clearIconTable = (): void => {
  iconTable = {}
}

export const iconFallback = iconFallbackJson.default

const hasNewerVersion = (
  cachedSemver: string | undefined,
  fetchedSemver: string
): boolean => {
  const oldParts = cachedSemver?.split('.')
  const newParts = fetchedSemver.split('.')

  for (let i = 0; i < newParts.length; i++) {
    const newInteger = ~~Number(newParts[i])
    const oldInteger = ~~Number(oldParts?.[i])

    if (newInteger > oldInteger) return true

    if (newInteger < oldInteger) return false
  }

  return false
}

interface App {
  attributes: {
    slug: string
    version: string
  }
}

interface FetchedApps {
  data: App[]
}

const attemptFetchApps = async (
  client: CozyClient
): Promise<FetchedApps | undefined> => {
  try {
    return (await client.fetchQueryAndGetFromState({
      definition: Q('io.cozy.apps'),
      options: {
        as: 'io.cozy.apps'
      }
    })) as FetchedApps
  } catch (error) {
    log.error(strings.errors.attemptFetchApps, error)
    if (getErrorMessage(error).includes('Invalid token')) await clearClient()
  }
}

const attemptCacheUpdate = async ({
  apps,
  cache,
  client
}: {
  apps: FetchedApps
  cache: IconsCache
  client: CozyClient
}): Promise<void> => {
  try {
    const slugsToUpdate = apps.data.reduce<App[]>(
      (acc, { attributes: { slug, version } }): App[] => {
        const cachedIcon = cache[slug]
        const cachedVersion = cachedIcon.version

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- value is NOT always falsy, or it's a bug
        if (!cachedIcon || hasNewerVersion(cachedVersion, version))
          return [...acc, { attributes: { slug, version } }]

        return acc
      },
      []
    )

    if (slugsToUpdate.length > 0) {
      await attemptFetchIcons({ data: slugsToUpdate }, client, cache)
    } else {
      setIconTable(cache)
    }
  } catch {
    await clearPersistentIconTable()
    await attemptFetchIcons(apps, client)
  }
}

const attemptFetchIcons = async (
  apps: FetchedApps,
  client: CozyClient,
  cache = {}
): Promise<void> => {
  const reduceFunction = async (
    acc: Promise<[string, { version: string; xml: string }][]>,
    { attributes: { slug, version } }: App
  ): Promise<[string, { version: string; xml: string }][]> => {
    try {
      const xml = await client
        .getStackClient()
        .fetchJSON<string>('GET', `/registry/${slug}/icon`)

      return [...(await acc), [slug, { version, xml }]]
    } catch {
      return await acc
    }
  }

  try {
    const apiTable = await apps.data.reduce<
      Promise<[string, { version: string; xml: string }][]>
    >(reduceFunction, Promise.resolve([]))

    await setPersistentIconTable({ ...cache, ...Object.fromEntries(apiTable) })
  } catch (error) {
    log.error(strings.errors.attemptFetchIcons, error)
  }
}

const getPersistentIconTable = async (): Promise<IconsCache | null> => {
  try {
    const table = await getData<IconsCache>(CozyPersistedStorageKeys.IconsTable)
    return table
  } catch (error) {
    log.error(strings.errors.getPersistentIconTable, error)
    return null
  }
}

const setPersistentIconTable = async (table: IconsCache): Promise<void> => {
  try {
    setIconTable(table)
    Object.entries(table).length > 0 &&
      (await storeData(CozyPersistedStorageKeys.IconsTable, table))
  } catch (error) {
    log.error(strings.errors.setPersistentIconTable, error)
  }
}

const clearPersistentIconTable = async (): Promise<void> => {
  try {
    await removeData(CozyPersistedStorageKeys.IconsTable)
  } catch (error) {
    log.error(strings.errors.clearPersistentIconTable, error)
  }
}

export const manageIconCache = async (client: CozyClient): Promise<void> => {
  const apps = await attemptFetchApps(client)
  const cache = await getPersistentIconTable()

  if (!apps && cache) return setIconTable(cache)

  if (apps && !cache) return attemptFetchIcons(apps, client)

  if (apps && cache) return attemptCacheUpdate({ apps, cache, client })
}

// Immediately try to get iconTable from cache
// Some view components render faster than the cache validation logic
// In that case we need to retrieve the iconTable if any as soon as possible
getPersistentIconTable()
  .then(iconsCache => iconsCache && setIconTable(iconsCache))
  .catch(error => log.warn('Failed to set iconTable at boot', error))
