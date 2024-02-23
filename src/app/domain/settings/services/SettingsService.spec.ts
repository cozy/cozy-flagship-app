import {
  CozyPersistedStorageKeys,
  getData,
  storeData,
  clearCozyData
} from '/libs/localStore/storage'
import { ensureAutoLockIsEnabled } from '/app/domain/settings/services/SettingsService'

jest.mock('@react-native-cookies/cookies', () => ({
  clearAll: jest.fn()
}))

describe('ensureAutoLockIsEnabled', () => {
  beforeEach(async () => await clearCozyData())

  it('should not tamper with autoLock value when already enabled', async () => {
    const expected = true

    await storeData(CozyPersistedStorageKeys.AutoLockEnabled, expected)

    await ensureAutoLockIsEnabled()

    const result = await getData(CozyPersistedStorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  it('should set autoLock value to true when the key does not exist', async () => {
    const expected = true

    await ensureAutoLockIsEnabled()

    const result = await getData(CozyPersistedStorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  it('should set autoLock value to true when the key exists with a false string', async () => {
    const expected = true

    await storeData(CozyPersistedStorageKeys.AutoLockEnabled, false)

    await ensureAutoLockIsEnabled()

    const result = await getData(CozyPersistedStorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  it('should set autoLock value to true when the key exists with a falsy value', async () => {
    const expected = true

    await storeData(CozyPersistedStorageKeys.AutoLockEnabled, '')

    await ensureAutoLockIsEnabled()

    const result = await getData(CozyPersistedStorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })

  /* Improbable case, but still possible */
  it('should not tamper with autoLock value when the key exists with a truthy value', async () => {
    const expected = 'foobar'

    await storeData(CozyPersistedStorageKeys.AutoLockEnabled, expected)

    await ensureAutoLockIsEnabled()

    const result = await getData(CozyPersistedStorageKeys.AutoLockEnabled)

    expect(result).toBe(expected)
  })
})
