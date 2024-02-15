import CozyClient, { useClient } from 'cozy-client'

import { normalizeFqdn } from '/libs/functions/stringHelpers'

import { storeData, getData } from './storage'

/*
  Linked to an account.
  Keys are prefixed with @user_<FQDN>_.
  Not removed at logout.
*/
export enum UserPersistedStorageKeys {
  LocalBackupConfig = 'AmiralAppLocalBackupConfig'
}

interface UserPersistedStorageItems {
  backupConfig: object
}

const formatKey = (
  client: CozyClient,
  name: UserPersistedStorageKeys
): string => {
  const rootURL = client.getStackClient().uri

  const { host: fqdn } = new URL(rootURL)

  const normalizedFqdn = normalizeFqdn(fqdn)

  return `@user_${normalizedFqdn}_${name}`
}

export const storeUserPersistedData = async (
  client: CozyClient | null,
  name: UserPersistedStorageKeys,
  value: UserPersistedStorageItems[keyof UserPersistedStorageItems]
): Promise<void> => {
  if (!client) return

  // @ts-expect-error Keys and values are already checked here as an UserPersistedStorageKeys
  await storeData(formatKey(client, name), value)
}

export const getUserPersistedData = async <T>(
  client: CozyClient | null,
  name: UserPersistedStorageKeys
): Promise<T | null> => {
  if (!client) return null

  // @ts-expect-error Keys and values are already checked here as an UserPersistedStorageKeys
  return await getData(formatKey(client, name))
}

interface UseUserPersistedStorage {
  storeUserPersistedData: (
    name: UserPersistedStorageKeys,
    value: UserPersistedStorageItems[keyof UserPersistedStorageItems]
  ) => Promise<void>
  getUserPersistedData: <T>(name: UserPersistedStorageKeys) => Promise<T | null>
}

export const useUserPersistedStorage = (): UseUserPersistedStorage => {
  const client = useClient()

  const storeUserPersistedDataWrapper = async (
    name: UserPersistedStorageKeys,
    value: UserPersistedStorageItems[keyof UserPersistedStorageItems]
  ): Promise<void> => storeUserPersistedData(client, name, value)

  const getUserPersistedDataWrapper = async <T>(
    name: UserPersistedStorageKeys
  ): Promise<T | null> => getUserPersistedData(client, name)

  return {
    storeUserPersistedData: storeUserPersistedDataWrapper,
    getUserPersistedData: getUserPersistedDataWrapper
  }
}
