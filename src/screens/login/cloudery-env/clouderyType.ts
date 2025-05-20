import {
  DevicePersistedStorageKeys,
  getData,
  storeData,
  StorageItems
} from '/libs/localStore/storage'

const ALL_CLOUDERY_TYPES = ['cozy', 'twake'] as const
const CLOUDERY_DEFAULT_TYPE = 'twake'
type ClouderyTypeTuple = typeof ALL_CLOUDERY_TYPES
export type ClouderyType = ClouderyTypeTuple[number]

export const isClouderyType = (value: string): value is ClouderyType => {
  return ALL_CLOUDERY_TYPES.includes(value as ClouderyType)
}

export const saveClouderyTypeOnAsyncStorage = (
  type: ClouderyType
): Promise<void> => {
  return storeData(DevicePersistedStorageKeys.ClouderyType, type)
}

export const getClouderyTypeFromAsyncStorage =
  async (): Promise<ClouderyType> => {
    const clouderyType = await getData<StorageItems['clouderyType']>(
      DevicePersistedStorageKeys.ClouderyType
    )

    if (!clouderyType || !isClouderyType(clouderyType)) {
      return CLOUDERY_DEFAULT_TYPE
    }

    return clouderyType
  }
