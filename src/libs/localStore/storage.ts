import AsyncStorage from '@react-native-async-storage/async-storage'
import { BiometryType } from 'react-native-biometrics'

import { logger } from '/libs/functions/logger'
const log = logger('storage.ts')
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()
const { setItem, getItem, removeItem } = AsyncStorage
export enum StorageKeys {
  AutoLockEnabled = '@cozy_AmiralApp_autoLockEnabled',
  BiometryActivated = '@cozy_AmiralApp_biometryActivated',
  Capabilities = '@cozy_AmiralApp_Capabilities',
  LastActivity = '@cozy_AmiralApp_lastActivity',
  DefaultRedirectionUrl = '@cozy_AmiralAppDefaultRedirectionUrl',
  SessionCreatedFlag = 'SESSION_CREATED_FLAG',
  IconsTable = '@cozy_AmiralAppIcons',
  IdStorageAdress = 'CozyGPSMemory.Id',
  FlagFailUploadStorageAdress = 'CozyGPSMemory.FlagFailUpload',
  LastPointUploadedAdress = 'CozyGPSMemory.LastPointUploaded',
  ShouldBeTrackingFlagStorageAdress = 'CozyGPSMemory.ShouldBeTrackingFlag',
  LastStopTransitionTsKey = 'CozyGPSMemory.LastStopTransitionTsKey',
  LastStartTransitionTsKey = 'CozyGPSMemory.LastStartTransitionTsKey',
  GeolocationTrackingConfig = 'CozyGPSMemory.TrackingConfig',
  Activities = 'CozyGPSMemory.Activities'
}

export type IconsCache = Record<string, { version: string; xml: string }>

export interface StorageItems {
  biometryActivated: boolean
  biometryType?: BiometryType
  sessionCreatedFlag: string
  iconCache: IconsCache
}

export const storeData = async (
  name: StorageKeys,
  value: StorageItems[keyof StorageItems]
): Promise<void> => {
  try {
    const startTime = performance.now()

    const res = JSON.stringify(value)

    const endTime = performance.now()

    console.log(`🔴 storeData parse took ${endTime - startTime} milliseconds.`)

    const startTime2 = performance.now()

    if (name.includes('AmiralAppLocalBackupConfig')) {
      storage.set(name, res)
    } else {
      await setItem(name, res)
    }

    const endTime2 = performance.now()

    console.log(
      `🔴 storeData write took ${endTime2 - startTime2} milliseconds.`
    )
  } catch (error) {
    log.error(`Failed to store key "${name}" to persistent storage`, error)
  }
}

export const getData = async <T>(name: StorageKeys): Promise<T | null> => {
  try {
    const startTime = performance.now()

    let value

    if (name.includes('AmiralAppLocalBackupConfig')) {
      value = storage.getString(name)
    } else {
      value = await getItem(name)
    }

    const endTime = performance.now()

    console.log(`🟢 getData read took ${endTime - startTime} milliseconds.`)

    const startTime2 = performance.now()

    const res = value !== null ? (JSON.parse(value) as T) : null

    const endTime2 = performance.now()

    console.log(`🟢 getData parse took ${endTime2 - startTime2} milliseconds.`)

    return res
  } catch (error) {
    log.error(`Failed to get key "${name}" from persistent storage`, error)
    return null
  }
}

export const clearData = async (): Promise<void> => {
  try {
    const keys = Object.values(StorageKeys)

    for (const key of keys) {
      await removeItem(key)
    }
  } catch (error) {
    log.error(`Failed to clear data from persistent storage`, error)
  }
}

// TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
export const hasMigratedFromAsyncStorage = storage.getBoolean(
  'hasMigratedFromAsyncStorage'
)

// TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
export async function migrateFromAsyncStorage(): Promise<void> {
  console.log('Migrating from AsyncStorage -> MMKV...')
  const start = global.performance.now()

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
      console.error(
        `Failed to migrate key "${key}" from AsyncStorage to MMKV!`,
        error
      )
      throw error
    }
  }

  storage.set('hasMigratedFromAsyncStorage', true)

  const end = global.performance.now()
  console.log(`Migrated from AsyncStorage -> MMKV in ${end - start}ms!`)
}
