import CozyClient from 'cozy-client'

import {
  getUserPersistedData as initialGetUserPersistedData,
  storeUserPersistedData as initialStoreUserPersistedData
} from '/libs/localStore/userPersistedStorage'
import { clearAllData } from '/libs/localStore/storage'

const getUserPersistedData = initialGetUserPersistedData as (
  client: CozyClient,
  name: string
) => Promise<unknown>
const storeUserPersistedData = initialStoreUserPersistedData as (
  client: CozyClient,
  name: string,
  value: unknown
) => Promise<unknown>

describe('userPersistedStorage', () => {
  const aliceClient = {
    getStackClient: () => ({ uri: 'https://alice.mycozy.cloud' })
  } as CozyClient

  const aliceClientWithPort = {
    getStackClient: () => ({ uri: 'https://alice.mycozy.cloud:8080' })
  } as CozyClient

  const bobClient = {
    getStackClient: () => ({ uri: 'https://bob.mycozy.cloud' })
  } as CozyClient

  beforeEach(async () => {
    await clearAllData()
  })

  it('should store as alice and retrieve as alice', async () => {
    const key = 'string'
    const value = 'test'
    await storeUserPersistedData(aliceClient, key, value)
    const result = await getUserPersistedData(aliceClient, key)
    expect(result).toStrictEqual(value)
  })

  it('should store as alice and not retrieve as alice with port', async () => {
    const key = 'string'
    const value = 'test'
    await storeUserPersistedData(aliceClient, key, value)
    const result = await getUserPersistedData(aliceClientWithPort, key)
    expect(result).toStrictEqual(null)
  })

  it('should store as alice and bob and retrieve as alice and bob', async () => {
    const aliceKey = 'string'
    const bobKey = 'string'
    const aliceValue = 'testAlice'
    const bobValue = 'testAlice'
    await storeUserPersistedData(aliceClient, aliceKey, aliceValue)
    await storeUserPersistedData(bobClient, bobKey, bobValue)
    const aliceResult = await getUserPersistedData(aliceClient, aliceKey)
    const bobResult = await getUserPersistedData(bobClient, bobKey)
    expect(aliceResult).toStrictEqual(aliceValue)
    expect(bobResult).toStrictEqual(bobValue)
  })

  it('should store as alice and not retrieve as bob', async () => {
    const key = 'string'
    const value = 'test'
    await storeUserPersistedData(aliceClient, key, value)
    const result = await getUserPersistedData(bobClient, key)
    expect(result).toStrictEqual(null)
  })
})
