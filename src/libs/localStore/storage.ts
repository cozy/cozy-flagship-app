import AsyncStorage from '@react-native-async-storage/async-storage'
import { Cookies } from '@react-native-cookies/cookies'
import { BiometryType } from 'react-native-biometrics'
import { MMKV } from 'react-native-mmkv'

import rnperformance from '/app/domain/performances/measure'
import { logger } from '/libs/functions/logger'
import { SerializedOfflineFilesConfiguration } from '/app/domain/io.cozy.files/offlineFilesConfiguration'
import type { OnboardingPartner } from '/screens/welcome/install-referrer/onboardingPartner'
import { OauthData } from '/libs/clientHelpers/persistClient'
import { UserPersistedStorageKeys } from '/libs/localStore/userPersistedStorage'

const log = logger('storage.ts')

export const storage = new MMKV()

const { removeItem, clear } = AsyncStorage

export type StorageKey = CozyPersistedStorageKeys | DevicePersistedStorageKeys

/*
  Linked to connected account.
  Removed at logout.
*/
export enum CozyPersistedStorageKeys {
  AutoLockEnabled = '@cozy_AmiralApp_autoLockEnabled',
  BiometryActivated = '@cozy_AmiralApp_biometryActivated',
  Capabilities = '@cozy_AmiralApp_Capabilities',
  LastActivity = '@cozy_AmiralApp_lastActivity',
  DefaultRedirectionUrl = '@cozy_AmiralAppDefaultRedirectionUrl',
  IconsTable = '@cozy_AmiralAppIcons',
  Oauth = '@cozy_AmiralAppOAuthConfig',
  Cookie = '@cozy_AmiralAppCookieConfig',
  SessionCreated = '@cozy_AmiralAppSessionCreated',
  OfflineFiles = '@cozy_AmiralAppOfflineFiles'
}

/*
  Linked to device.
  Not removed at logout.
*/
export enum DevicePersistedStorageKeys {
  LogsEnabled = '@cozy_AmiralAppLogsEnabled',
  OnboardingPartner = '@cozy_AmiralAppOnboardingPartnerConfig',
  ClouderyEnv = '@cozy_AmiralAppClouderyEnvConfig',
  ClouderyType = '@cozy_AmiralAppClouderyTypeConfig',
  Bundle = '@cozy_AmiralAppBundleConfig'
}

export type IconsCache = Record<string, { version: string; xml: string }>

export interface StorageItems {
  biometryActivated: boolean
  biometryType?: BiometryType
  iconCache: IconsCache
  onboardingPartner: OnboardingPartner
  oauth: OauthData
  cookie: Cookies
  clouderyEnv: string
  clouderyType: string
  logsEnabled: number
  offlineFiles: SerializedOfflineFilesConfiguration
}

export const storeData = async (
  name: StorageKey,
  value: StorageItems[keyof StorageItems]
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
  try {
    const markName = rnperformance.mark(`setData ${name}`)
    storage.set(name, JSON.stringify(value))

    rnperformance.measure({
      markName: markName,
      category: 'AsyncStorageSet'
    })
  } catch (error) {
    log.error(`Failed to store key "${name}" to persistent storage`, error)
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getData = async <T>(name: StorageKey): Promise<T | null> => {
  try {
    const markName = rnperformance.mark(`getData ${name}`)
    const value = storage.getString(name)

    rnperformance.measure({
      markName: markName,
      category: 'AsyncStorageGet'
    })
    return value !== null && value !== undefined
      ? (JSON.parse(value) as T)
      : null
  } catch (error) {
    log.error(`Failed to get key "${name}" from persistent storage`, error)
    return null
  }
}

export const clearCozyData = async (): Promise<void> => {
  try {
    const keys = storage.getAllKeys()
    const keysToKeep = [
      ...Object.values(DevicePersistedStorageKeys),
      ...Object.values(UserPersistedStorageKeys)
    ] as string[]

    for (const key of keys) {
      if (!keysToKeep.includes(key)) {
        await removeItem(key)
        storage.delete(key)
      }
    }
  } catch (error) {
    log.error(`Failed to clear data from persistent storage`, error)
  }
}

export const clearAllData = async (): Promise<void> => {
  try {
    await clear()
    storage.clearAll()
  } catch (error) {
    log.error(`Failed to clear all data from persistent storage`, error)
  }
}

export const removeData = async (name: StorageKey): Promise<void> => {
  try {
    await removeItem(name)
    storage.delete(name)
  } catch (error) {
    log.error(`Failed to remove key "${name}" from persistent storage`, error)
  }
}

// TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
export const hasMigratedFromAsyncStorage = storage.getBoolean(
  'hasMigratedFromAsyncStorage'
)

// TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
export async function migrateFromAsyncStorage(): Promise<void> {
  log.info('Migrating from AsyncStorage -> MMKV...')
  const markName = rnperformance.mark('migrateFromAsyncStorage')

  const keys = await AsyncStorage.getAllKeys()

  for (const key of keys) {
    try {
      const value = await AsyncStorage.getItem(key)

      if (value != null) {
        storage.set(key, value)
      }
    } catch (error) {
      log.error(
        `Failed to migrate key "${key}" from AsyncStorage to MMKV!`,
        error
      )
      throw error
    }
  }

  storage.set('hasMigratedFromAsyncStorage', true)

  rnperformance.measure({
    markName: markName,
    category: 'AsyncStorageMigration'
  })
  log.info(`Migrated from AsyncStorage -> MMKV!`)
}
