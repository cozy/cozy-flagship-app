import AsyncStorage from '@react-native-async-storage/async-storage'

import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { normalizeFqdn } from '/libs/functions/stringHelpers'
import { AppData } from '/libs/httpserver/models'
import { getData, storeData, storage } from '/libs/localStore/storage'

const log = Minilog('clientCachedStorage.ts')

const clientCachePrefix = '@ccCache_'

type CozyClientCacheKey = `@ccCache_${string}`

type CacheableObject = AppData

interface CozyClientRequest {
  method: unknown
  path: unknown
  body: unknown
  options: unknown
}

const { getAllKeys, removeItem } = AsyncStorage

export const storeClientCachedData = async (
  client: CozyClient | null,
  request: string | CozyClientRequest,
  result: CacheableObject
): Promise<void> => {
  if (!client) return

  const key = formatKey(client, request)

  // @ts-expect-error Keys and values are already checked here as an CozyClientCacheKey
  await storeData(key, result)
}

export const getClientCachedData = async <T extends CacheableObject>(
  client: CozyClient | null,
  request: string | CozyClientRequest
): Promise<T | null> => {
  if (!client) return null

  const key = formatKey(client, request)

  // @ts-expect-error Keys and values are already checked here as an CozyClientCacheKey
  const result = await getData<T>(key)

  return result
}

export const clearClientCachedData = async (
  client: CozyClient | null
): Promise<void> => {
  await clearClientCachedDataAsyncStorage(client)
  await clearClientCachedDataMMKV(client)
}

// TODO: Remove `clearClientCachedDataAsyncStorage` after a while (when everyone has migrated)
const clearClientCachedDataAsyncStorage = async (
  client: CozyClient | null
): Promise<void> => {
  try {
    if (!client) return

    const normalizedFqdn = getNormalizedFqdn(client)
    const keys = await getAllKeys()

    const clientCacheKeys = keys.filter(k =>
      k.startsWith(`${clientCachePrefix}${normalizedFqdn}`)
    )

    for (const key of clientCacheKeys) {
      await removeItem(key)
    }
  } catch (error) {
    log.error(
      `Failed to clear ClientCache data from persistent storage (AsyncStorage)`,
      error
    )
  }
}

const clearClientCachedDataMMKV = async (
  client: CozyClient | null
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
  try {
    if (!client) return

    const normalizedFqdn = getNormalizedFqdn(client)
    const keys = storage.getAllKeys()

    const clientCacheKeys = keys.filter(k =>
      k.startsWith(`${clientCachePrefix}${normalizedFqdn}`)
    )

    for (const key of clientCacheKeys) {
      storage.remove(key)
    }
  } catch (error) {
    log.error(
      `Failed to clear ClientCache data from persistent storage (MMKV)`,
      error
    )
  }
}

const formatKey = (
  client: CozyClient,
  request: string | CozyClientRequest
): CozyClientCacheKey => {
  const normalizedFqdn = getNormalizedFqdn(client)

  const key =
    typeof request === 'string' ? request : btoa(JSON.stringify(request))

  return `${clientCachePrefix}${normalizedFqdn}_${key}`
}

const getNormalizedFqdn = (client: CozyClient): string => {
  const rootURL = client.getStackClient().uri

  const { host: fqdn } = new URL(rootURL)

  const normalizedFqdn = normalizeFqdn(fqdn)

  return normalizedFqdn
}
