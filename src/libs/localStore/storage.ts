import AsyncStorage from '@react-native-async-storage/async-storage'
import { BiometryType } from 'react-native-biometrics'

import { logger } from '/libs/functions/logger'
import type { FirstTimeserie } from '/app/domain/geolocation/helpers/quota'

const log = logger('storage.ts')

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
  Activities = 'CozyGPSMemory.Activities',
  FirstTimeserie = 'CozyGPSMemory.FirstTimeserie',
  ServiceWebhookURL = 'CozyGPSMemory.ServiceWebhookURL'
}

export type IconsCache = Record<string, { version: string; xml: string }>

export interface StorageItems {
  biometryActivated: boolean
  biometryType?: BiometryType
  sessionCreatedFlag: string
  iconCache: IconsCache
  firstTimeserie: FirstTimeserie
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

export const getData = async <T>(name: StorageKeys): Promise<T | null> => {
  try {
    const value = await getItem(name)

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

export const removeData = async (name: StorageKeys): Promise<void> => {
  try {
    await removeItem(name)
  } catch (error) {
    log.error(`Failed to remove key "${name}" from persistent storage`, error)
  }
}
