/* eslint-disable no-bitwise */
import AsyncStorage from '@react-native-async-storage/async-storage'

import Minilog from '@cozy/minilog'

import strings from '../../strings.json'
import iconFallbackJson from '../../assets/iconFallback.json'
import { clearClient } from '../client'

const log = Minilog('Icon Table')
Minilog.enable()

export let iconTable = {}
const setIconTable = table => (iconTable = table)
export const TESTING_ONLY_clearIconTable = () => (iconTable = {})
export const iconFallback = iconFallbackJson.default

const hasNewerVersion = (cachedSemver, fetchedSemver) => {
  const oldParts = cachedSemver.split('.')
  const newParts = fetchedSemver.split('.')
  for (var i = 0; i < newParts.length; i++) {
    const newInteger = ~~newParts[i]
    const oldInteger = ~~oldParts[i]
    if (newInteger > oldInteger) {
      return true
    }
    if (newInteger < oldInteger) {
      return false
    }
  }
  return false
}

const attemptFetchApps = async client => {
  try {
    return await client.getStackClient().fetchJSON('GET', '/apps/')
  } catch (error) {
    log.error(strings.errors.attemptFetchApps, error)
    if (error.message === 'Invalid token') clearClient()
    return undefined
  }
}

const attemptCacheUpdate = async ({ apps, cache, client }) => {
  try {
    const slugsToUpdate = apps.data.reduce(
      (acc, { attributes: { slug, version } }) => {
        if (!cache[slug] || hasNewerVersion(cache[slug].version, version)) {
          return [...acc, { attributes: { slug, version } }]
        }

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

const attemptFetchIcons = async (apps, client, cache = {}) => {
  try {
    const apiTable = await apps.data.reduce(
      async (acc, { attributes: { slug, version } }) => {
        try {
          const xml = await client
            .getStackClient()
            .fetchJSON('GET', `/registry/${slug}/icon`)

          return [...(await acc), [slug, { version, xml }]]
        } catch {
          return await acc
        }
      },
      []
    )

    setPersistentIconTable({ ...cache, ...Object.fromEntries(apiTable) })
  } catch (error) {
    log.error(strings.errors.attemptFetchIcons, error)
  }
}

const getPersistentIconTable = async () => {
  try {
    return JSON.parse(await AsyncStorage.getItem(strings.APPS_ICONS))
  } catch {
    return null
  }
}

const setPersistentIconTable = async table => {
  try {
    setIconTable(table)
    Object.entries(table).length > 0 &&
      AsyncStorage.setItem(strings.APPS_ICONS, JSON.stringify(table))
  } catch (error) {
    log.error(strings.errors.setPersistentIconTable, error)
  }
}

const clearPersistentIconTable = async () => {
  try {
    await AsyncStorage.removeItem(strings.APPS_ICONS)
  } catch (error) {
    log.error(strings.errors.clearPersistentIconTable, error)
  }
}

export const manageIconCache = async client => {
  const apps = await attemptFetchApps(client)
  const cache = await getPersistentIconTable()

  if (!apps && !cache) {
    return
  }

  if (!apps && cache) {
    return await setIconTable(cache)
  }

  cache
    ? await attemptCacheUpdate({ apps, cache, client })
    : await attemptFetchIcons(apps, client)
}
