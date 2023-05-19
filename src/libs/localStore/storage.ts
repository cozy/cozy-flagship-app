import AsyncStorage from '@react-native-async-storage/async-storage'
import { BiometryType } from 'react-native-biometrics'

import { logger } from '/libs/functions/logger'

const log = logger('storage.ts')

const { setItem, getItem, removeItem } = AsyncStorage

export enum StorageKeys {
  AutoLockEnabled = '@cozy_AmiralApp_autoLockEnabled',
  BiometryActivated = '@cozy_AmiralApp_biometryActivated',
  Capabilities = '@cozy_AmiralApp_Capabilities',
  LastActivity = '@cozy_AmiralApp_lastActivity',
  DefaultRedirectionUrl = '@cozy_AmiralAppDefaultRedirectionUrl',
  SessionCreatedFlag = 'SESSION_CREATED_FLAG'
}

interface StorageItems {
  biometryActivated: boolean
  biometryType?: BiometryType
  sessionCreatedFlag: string
}

export const storeData = async (
  name: StorageKeys,
  value: StorageItems[keyof StorageItems]
): Promise<void> => {
  try {
    // Convert value to a string before storing it
    const stringValue =
      typeof value === 'boolean' ? String(value) : JSON.stringify(value)
    await setItem(name, stringValue)
  } catch (error) {
    log.error(`Failed to store key "${name}" to persistent storage`, error)
  }
}

export const getData = async <T>(name: StorageKeys): Promise<T | null> => {
  try {
    const value = await getItem(name)

    if (value === 'true') return true as unknown as T
    if (value === 'false') return false as unknown as T

    return value !== null ? (JSON.parse(value) as T) : null
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
