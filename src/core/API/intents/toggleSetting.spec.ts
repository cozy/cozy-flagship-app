import AsyncStorage from '@react-native-async-storage/async-storage'

import { StorageKeys } from '../localStore/storage'

import { ensureAutoLockIsEnabled } from '/libs/intents/toggleSetting'

jest.mock('@react-native-cookies/cookies', () => ({
  clearAll: jest.fn()
}))

describe('ensureAutoLockIsEnabled', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('should not tamper with autoLock value when already enabled', async () => {
    const expected = 'true'

    await AsyncStorage.setItem(StorageKeys.AutoLockEnabled, expected)

    await ensureAutoLockIsEnabled()

    const result = await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  it('should set autoLock value to true when the key does not exist', async () => {
    const expected = 'true'

    await ensureAutoLockIsEnabled()

    const result = await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  it('should set autoLock value to true when the key exists with a false string', async () => {
    const expected = 'true'

    await AsyncStorage.setItem(StorageKeys.AutoLockEnabled, 'false')

    await ensureAutoLockIsEnabled()

    const result = await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  it('should set autoLock value to true when the key exists with a falsy value', async () => {
    const expected = 'true'

    await AsyncStorage.setItem(StorageKeys.AutoLockEnabled, '')

    await ensureAutoLockIsEnabled()

    const result = await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  /* Improbable case, but still possible */
  it('should not tamper with autoLock value when the key exists with a truthy value', async () => {
    const expected = '"foobar"'

    await AsyncStorage.setItem(StorageKeys.AutoLockEnabled, expected)

    await ensureAutoLockIsEnabled()

    const result = await AsyncStorage.getItem(StorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })
})
