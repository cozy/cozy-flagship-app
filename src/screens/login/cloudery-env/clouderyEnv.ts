import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

import strings from '/constants/strings.json'

const ALL_CLOUDERY_ENV = ['DEV', 'INT', 'PROD'] as const
const CLOUDERY_DEFAULT_ENV = 'PROD'
type ClouderyEnvTuple = typeof ALL_CLOUDERY_ENV
export type ClouderyEnv = ClouderyEnvTuple[number]

export const isClouderyEnv = (value: string): value is ClouderyEnv => {
  return ALL_CLOUDERY_ENV.includes(value as ClouderyEnv)
}

export const saveClouderyEnvOnAsyncStorage = (
  environment: ClouderyEnv
): Promise<void> => {
  return AsyncStorage.setItem(strings.CLOUDERY_ENV_STORAGE_KEY, environment)
}

export const getClouderyEnvFromAsyncStorage =
  async (): Promise<ClouderyEnv> => {
    const clouderyEnv = await AsyncStorage.getItem(
      strings.CLOUDERY_ENV_STORAGE_KEY
    )

    if (!clouderyEnv || !isClouderyEnv(clouderyEnv)) {
      return CLOUDERY_DEFAULT_ENV
    }

    return clouderyEnv
  }

export const getClouderyUrl = async (): Promise<string> => {
  const clouderyEnv = await getClouderyEnvFromAsyncStorage()

  const baseUris: Record<ClouderyEnv, string> = {
    PROD: strings.clouderyProdBaseUri,
    INT: strings.clouderyIntBaseUri,
    DEV: strings.clouderyDevBaseUri
  }

  const relativeUri =
    Platform.OS === 'ios'
      ? strings.clouderyiOSRelativeUri
      : strings.clouderyAndroidRelativeUri

  return baseUris[clouderyEnv] + relativeUri
}
