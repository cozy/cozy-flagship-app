import AsyncStorage from '@react-native-async-storage/async-storage'
import { Cookies } from '@react-native-cookies/cookies'
import { BiometryType } from 'react-native-biometrics'
import { MMKV } from 'react-native-mmkv'

import rnperformance from '/app/domain/performances/measure'
import { logger } from '/libs/functions/logger'
import type { FirstTimeserie } from '/app/domain/geolocation/helpers/quota'
import { SerializedOfflineFilesConfiguration } from '/app/domain/io.cozy.files/offlineFilesConfiguration'
import type { OnboardingPartner } from '/screens/welcome/install-referrer/onboardingPartner'
import { OauthData } from '/libs/clientHelpers/persistClient'

const log = logger('storage.ts')

export const storage = new MMKV()

const { setItem, getItem, removeItem, clear } = AsyncStorage

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
  IdStorageAdress = 'CozyGPSMemory.Id',
  FlagFailUploadStorageAdress = 'CozyGPSMemory.FlagFailUpload',
  LastPointUploadedAdress = 'CozyGPSMemory.LastPointUploaded',
  ShouldBeTrackingFlagStorageAdress = 'CozyGPSMemory.ShouldBeTrackingFlag',
  LastStopTransitionTsKey = 'CozyGPSMemory.LastStopTransitionTsKey',
  LastStartTransitionTsKey = 'CozyGPSMemory.LastStartTransitionTsKey',
  GeolocationTrackingConfig = 'CozyGPSMemory.TrackingConfig',
  Activities = 'CozyGPSMemory.Activities',
  FirstTimeserie = 'CozyGPSMemory.FirstTimeserie',
  ServiceWebhookURL = 'CozyGPSMemory.ServiceWebhookURL',
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
  Bundle = '@cozy_AmiralAppBundleConfig'
}

export type IconsCache = Record<string, { version: string; xml: string }>

export interface StorageItems {
  biometryActivated: boolean
  biometryType?: BiometryType
  iconCache: IconsCache
  firstTimeserie: FirstTimeserie
  onboardingPartner: OnboardingPartner
  oauth: OauthData
  cookie: Cookies
  clouderyEnv: string
  logsEnabled: number
  offlineFiles: SerializedOfflineFilesConfiguration
}

export const storeData = async (
  name: StorageKey,
  value: StorageItems[keyof StorageItems]
): Promise<void> => {
  try {
    const markName = `setData ${name}`
    rnperformance.mark(markName)
    storage.set(name, JSON.stringify(value))

    rnperformance.measure(markName, markName, 'AsyncStorageSet')
  } catch (error) {
    log.error(`Failed to store key "${name}" to persistent storage`, error)
  }
}

export const getData = async <T>(name: StorageKey): Promise<T | null> => {
  try {
    const markName = `getData ${name}`
    rnperformance.mark(markName)
    const value = storage.getString(name)

    rnperformance.measure(markName, markName, 'AsyncStorageGet')
    return value !== null ? (JSON.parse(value) as T) : null
  } catch (error) {
    /*
      If we tried to parse the default redirection url and it failed, we return it as is
      because previously it was stored as a string where as now it is stored as a stringified string.

      Default redirection url is written often, so active users
      will automatically remove the old format from their local storage.

      In some weeks we will be able to remove this compatibility code.
    */
    if (name === CozyPersistedStorageKeys.DefaultRedirectionUrl) {
      const value = await getItem(name)
      return value as T
    }

    log.error(`Failed to get key "${name}" from persistent storage`, error)
    return null
  }
}

export const clearCozyData = async (): Promise<void> => {
  try {
    const keys = Object.values(CozyPersistedStorageKeys)

    for (const key of keys) {
      await removeItem(key)
    }
  } catch (error) {
    log.error(`Failed to clear data from persistent storage`, error)
  }
}

export const clearAllData = async (): Promise<void> => {
  try {
    await clear()
  } catch (error) {
    log.error(`Failed to clear all data from persistent storage`, error)
  }
}

export const removeData = async (name: StorageKey): Promise<void> => {
  try {
    await removeItem(name)
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
  const markName = `migrateFromAsyncStorage`
  rnperformance.mark(markName)

  const keys = await AsyncStorage.getAllKeys()

  for (const key of keys) {
    try {
      const value = await AsyncStorage.getItem(key)

      if (value != null) {
        if (['true', 'false'].includes(value)) {
          storage.set(key, value === 'true')
        } else {
          storage.set(key, value)
        }
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

  rnperformance.measure(markName, markName, 'AsyncStorageMigration')
  log.info(`Migrated from AsyncStorage -> MMKV!`)
}
