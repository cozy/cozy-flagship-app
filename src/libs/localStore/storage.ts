import AsyncStorage from '@react-native-async-storage/async-storage'

import { logger } from '/libs/functions/logger'

const log = logger('storage.ts')

const { setItem, getItem } = AsyncStorage

export enum StorageKeys {
  BiometryActivated = '@cozy_AmiralApp_biometryActivated',
  Capabilities = '@cozy_AmiralApp_Capabilities',
  SessionCreatedFlag = 'SESSION_CREATED_FLAG'
}

interface StorageItems {
  biometryActivated: boolean
  capabilities: {
    hasBiometry: boolean
    biometryType: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Unknown'
  }
  sessionCreatedFlag: string
}

export const storeData = async (
  name: StorageKeys,
  value: StorageItems[keyof StorageItems]
): Promise<void> => {
  try {
    await setItem(name, JSON.stringify(value))
  } catch (error) {
    log.error(`Failed to store key "${name}" to persistent storage`, error)
  }
}

export const getData = async (
  name: StorageKeys
): Promise<StorageItems[keyof StorageItems] | null> => {
  try {
    const value = await getItem(name)

    return value !== null
      ? (JSON.parse(value) as StorageItems[keyof StorageItems])
      : null
  } catch (error) {
    log.error(`Failed to get key "${name}" from persistent storage`, error)
    return null
  }
}
