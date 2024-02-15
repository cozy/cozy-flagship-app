import AsyncStorage from '@react-native-async-storage/async-storage'
import { Cookies } from '@react-native-cookies/cookies'
import { BiometryType } from 'react-native-biometrics'

import { logger } from '/libs/functions/logger'
import type { FirstTimeserie } from '/app/domain/geolocation/helpers/quota'
import type { OnboardingPartner } from '/screens/welcome/install-referrer/onboardingPartner'

const log = logger('storage.ts')

const { setItem, getItem, removeItem, clear } = AsyncStorage

/*
  Linked to connected account.
  Removed at logout.
*/
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
  ServiceWebhookURL = 'CozyGPSMemory.ServiceWebhookURL',
  Oauth = '@cozy_AmiralAppOAuthConfig',
  Cookie = '@cozy_AmiralAppCookieConfig'
}

/*
  Linked to device.
  Not removed at logout.
*/
export enum DevicePersistedStorageKeys {
  OnboardingPartner = '@cozy_AmiralAppOnboardingPartnerConfig',
  ClouderyEnv = '@cozy_AmiralAppClouderyEnvConfig',
  Bundle = '@cozy_AmiralAppBundleConfig'
}

export type IconsCache = Record<string, { version: string; xml: string }>

export interface StorageItems {
  biometryActivated: boolean
  biometryType?: BiometryType
  sessionCreatedFlag: string
  iconCache: IconsCache
  firstTimeserie: FirstTimeserie
  onboardingPartner: OnboardingPartner
  cookie: Cookies
  clouderyEnv: string
}

export const storeData = async (
  name: StorageKeys | DevicePersistedStorageKeys,
  value: StorageItems[keyof StorageItems]
): Promise<void> => {
  try {
    await setItem(name, JSON.stringify(value))
  } catch (error) {
    log.error(`Failed to store key "${name}" to persistent storage`, error)
  }
}

export const getData = async <T>(
  name: StorageKeys | DevicePersistedStorageKeys
): Promise<T | null> => {
  try {
    const value = await getItem(name)

    return value !== null ? (JSON.parse(value) as T) : null
  } catch (error) {
    /*
      If we tried to parse the default redirection url and it failed, we return it as is
      because previously it was stored as a string where as now it is stored as a stringified string.

      Default redirection url is written often, so active users
      will automatically remove the old format from their local storage.

      In some weeks we will be able to remove this compatibility code.
    */
    if (name === StorageKeys.DefaultRedirectionUrl) {
      const value = await getItem(name)
      return value as T
    }

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

export const clearAllData = async (): Promise<void> => {
  try {
    await clear()
  } catch (error) {
    log.error(`Failed to clear all data from persistent storage`, error)
  }
}

export const removeData = async (
  name: StorageKeys | DevicePersistedStorageKeys
): Promise<void> => {
  try {
    await removeItem(name)
  } catch (error) {
    log.error(`Failed to remove key "${name}" from persistent storage`, error)
  }
}
