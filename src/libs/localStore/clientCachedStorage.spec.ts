import CozyClient from 'cozy-client'

import {
  clearClientCachedData,
  getClientCachedData,
  storeClientCachedData
} from '/libs/localStore/clientCachedStorage'
import { storage } from '/libs/localStore/storage'
import { AppData } from '/libs/httpserver/models'
import {
  clearAllData,
  CozyPersistedStorageKeys,
  storeData
} from '/libs/localStore/storage'

describe('clientCachedStorage', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  describe('key tests', () => {
    it('should use raw request for key when string', async () => {
      const request = 'SomeRequestName'

      await storeClientCachedData(aliceClient, request, getFakeAppData())
      const keys = storage.getAllKeys()

      expect(keys).toStrictEqual([
        '@ccCache_alice.mycozy.cloud_SomeRequestName'
      ])
    })

    it('should convert request to base64 for key when request CozyClientRequest object', async () => {
      const request = {
        method: 'GET',
        path: '/some/path',
        body: {},
        options: {}
      }

      await storeClientCachedData(aliceClient, request, getFakeAppData())
      const keys = storage.getAllKeys()

      expect(keys).toStrictEqual([
        '@ccCache_alice.mycozy.cloud_eyJtZXRob2QiOiJHRVQiLCJwYXRoIjoiL3NvbWUvcGF0aCIsImJvZHkiOnt9LCJvcHRpb25zIjp7fX0='
      ])
    })
  })

  describe('isolation tests', () => {
    it('should store as alice and retrieve as alice', async () => {
      const request = 'SomeRequestName'

      await storeClientCachedData(aliceClient, request, getFakeAppData())
      const result = await getClientCachedData(aliceClient, request)
      expect(result).toStrictEqual(getFakeAppData())
    })

    it('should store as alice and not retrieve as alice with port', async () => {
      const request = 'SomeRequestName'
      await storeClientCachedData(aliceClient, request, getFakeAppData())
      const result = await getClientCachedData(aliceClientWithPort, request)
      expect(result).toStrictEqual(null)
    })

    it('should store as alice and bob and retrieve as alice and bob', async () => {
      const aliceRequest = 'SomeRequestName'
      const bobRequest = 'SomeRequestName'
      await storeClientCachedData(
        aliceClient,
        aliceRequest,
        getFakeAppData('TestAlice')
      )
      await storeClientCachedData(
        bobClient,
        bobRequest,
        getFakeAppData('TestBob')
      )
      const aliceResult = await getClientCachedData(aliceClient, aliceRequest)
      const bobResult = await getClientCachedData(bobClient, bobRequest)
      expect(aliceResult).toStrictEqual(getFakeAppData('TestAlice'))
      expect(bobResult).toStrictEqual(getFakeAppData('TestBob'))
    })

    it('should store as alice and not retrieve as bob', async () => {
      const request = 'SomeRequestName'
      await storeClientCachedData(
        aliceClient,
        request,
        getFakeAppData('TestAlice')
      )
      const result = await getClientCachedData(bobClient, request)
      expect(result).toStrictEqual(null)
    })
  })

  describe('clearClientCachedData', () => {
    it('should clear only data relative to clientCachedStorage', async () => {
      await storeData(
        // @ts-expect-error Type validation is handled on clientCachedStorage
        '@ccCache_alice.mycozy.cloud_SomeRequestName',
        'SomeValue'
      )
      await storeData(
        // @ts-expect-error Type validation is handled on clientCachedStorage
        '@ccCache_alice.mycozy.cloud_eyJtZXRob2QiOiJHRVQiLCJwYXRoIjoiL3NvbWUvcGF0aCIsImJvZHkiOnt9LCJvcHRpb25zIjp7fX0=',
        'SomeValue'
      )
      await storeData(CozyPersistedStorageKeys.Activities, 'SomeValue')
      await storeData(CozyPersistedStorageKeys.AutoLockEnabled, 'SomeValue')

      const keys = storage.getAllKeys()
      expect(keys).toStrictEqual([
        '@ccCache_alice.mycozy.cloud_SomeRequestName',
        '@ccCache_alice.mycozy.cloud_eyJtZXRob2QiOiJHRVQiLCJwYXRoIjoiL3NvbWUvcGF0aCIsImJvZHkiOnt9LCJvcHRpb25zIjp7fX0=',
        CozyPersistedStorageKeys.Activities,
        CozyPersistedStorageKeys.AutoLockEnabled
      ])

      await clearClientCachedData(aliceClient)

      const keys2 = storage.getAllKeys()
      expect(keys2).toStrictEqual([
        CozyPersistedStorageKeys.Activities,
        CozyPersistedStorageKeys.AutoLockEnabled
      ])
    })

    it('should clear only data relative to current client', async () => {
      await storeData(
        // @ts-expect-error Type validation is handled on clientCachedStorage
        '@ccCache_alice.mycozy.cloud_SomeRequestName',
        'SomeValue'
      )
      await storeData(
        // @ts-expect-error Type validation is handled on clientCachedStorage
        '@ccCache_alice.mycozy.cloud_eyJtZXRob2QiOiJHRVQiLCJwYXRoIjoiL3NvbWUvcGF0aCIsImJvZHkiOnt9LCJvcHRpb25zIjp7fX0=',
        'SomeValue'
      )
      await storeData(
        // @ts-expect-error Type validation is handled on clientCachedStorage
        '@ccCache_bob.mycozy.cloud_SomeRequestName',
        'SomeValue'
      )

      const keys = storage.getAllKeys()
      expect(keys).toStrictEqual([
        '@ccCache_alice.mycozy.cloud_SomeRequestName',
        '@ccCache_alice.mycozy.cloud_eyJtZXRob2QiOiJHRVQiLCJwYXRoIjoiL3NvbWUvcGF0aCIsImJvZHkiOnt9LCJvcHRpb25zIjp7fX0=',
        '@ccCache_bob.mycozy.cloud_SomeRequestName'
      ])

      await clearClientCachedData(aliceClient)

      const keys2 = storage.getAllKeys()
      expect(keys2).toStrictEqual(['@ccCache_bob.mycozy.cloud_SomeRequestName'])
    })
  })
})

const aliceClient = {
  getStackClient: () => ({ uri: 'https://alice.mycozy.cloud' })
} as CozyClient

const aliceClientWithPort = {
  getStackClient: () => ({ uri: 'https://alice.mycozy.cloud:8080' })
} as CozyClient

const bobClient = {
  getStackClient: () => ({ uri: 'https://bob.mycozy.cloud' })
} as CozyClient

const getFakeAppData = (id = 'SomeId'): AppData => ({
  attributes: {
    AppEditor: 'SomeAppEditor',
    AppName: 'SomeAppName',
    AppNamePrefix: 'SomeAppNamePrefix',
    AppSlug: 'SomeAppSlug',
    Capabilities: 'SomeCapabilities',
    Cookie: 'SomeCookie',
    CozyBar: 'SomeCozyBar',
    CozyClientJS: 'SomeCozyClientJS',
    CozyFonts: 'SomeCozyFonts',
    DefaultWallpaper: 'SomeDefaultWallpaper',
    Domain: 'SomeDomain',
    Favicon: 'SomeFavicon',
    Flags: 'SomeFlags',
    IconPath: 'SomeIconPath',
    Locale: 'SomeLocale',
    SubDomain: 'SomeSubDomain',
    ThemeCSS: 'SomeThemeCSS',
    Token: 'SomeToken',
    Tracking: 'SomeTracking'
  },
  id: id,
  links: { self: 'SomeSelf' },
  meta: {},
  type: 'SomeType'
})
