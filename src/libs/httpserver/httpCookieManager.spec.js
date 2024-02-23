import CookieManager from '@react-native-cookies/cookies'

import { createMockClient } from 'cozy-client/dist/mock'

import { getCookie, resyncCookies, setCookie } from './httpCookieManager'

import {
  CozyPersistedStorageKeys,
  getData,
  storeData,
  clearAllData
} from '/libs/localStore/storage'

jest.mock('/libs/localStore/storage')

jest.mock('@react-native-cookies/cookies', () => ({
  set: jest.fn()
}))

jest.mock('cozy-client', () => ({
  ...jest.requireActual('cozy-client'),
  useAppsInMaintenance: jest.fn()
}))

let mockedDate = '2022-09-23T09:36:13.358Z'
let tenYearsAfterMockedDate = '2032-09-23T09:36:13.358Z'
export class MockDate extends Date {
  constructor(arg) {
    super(arg || mockedDate)
  }
}

describe('httpCookieManager', () => {
  const client = createMockClient({})

  beforeEach(async () => {
    await clearAllData()
    jest.clearAllMocks()
    global.Date = MockDate
  })

  afterEach(() => {
    global.Date = Date
  })

  describe('setCookie', () => {
    it(`should set cookie from parsed string`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io'
      }))

      const cookieString =
        'cozysessid=AAAAAGJ3Ojku0Nzk4YzhlNWQ1ODkTc2tq3IuDMgJZTZhME3MTQ3OT3ODA3YU0MTYwgeWmEE3IsoDkhQcjx0zh-2lpoItEDU8; Path=/; Domain=cozy.10-0-2-2.nip.io; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://cozy.10-0-2-2.nip.io',
        {
          name: 'cozysessid',
          value:
            'AAAAAGJ3Ojku0Nzk4YzhlNWQ1ODkTc2tq3IuDMgJZTZhME3MTQ3OT3ODA3YU0MTYwgeWmEE3IsoDkhQcjx0zh-2lpoItEDU8',
          domain: '.cozy.10-0-2-2.nip.io',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should force SameSite to None`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString =
        'cozysessid=SOME_VALUE; Path=/; Domain=SOME_DOMAIN; HttpOnly; SameSite=Lax'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://SOME_DOMAIN',
        {
          name: 'cozysessid',
          value: 'SOME_VALUE',
          domain: '.SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should set secure to false if cozy-client's protocol is HTTP`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString =
        'cozysessid=SOME_VALUE; Path=/; Domain=SOME_DOMAIN; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://SOME_DOMAIN',
        {
          name: 'cozysessid',
          value: 'SOME_VALUE',
          domain: '.SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should set secure to true if cozy-client's protocol is HTTPs`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'https://SOME_DOMAIN'
      }))

      const cookieString =
        'cozysessid=SOME_VALUE; Path=/; Domain=SOME_DOMAIN; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'https://SOME_DOMAIN',
        {
          name: 'cozysessid',
          value: 'SOME_VALUE',
          domain: '.SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: true,
          httpOnly: true,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should handle 'sess-XXX' named cookies on flat domains`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString =
        'sess-cozy09200a3b616296ca886afa00ee4b4da5=SOME_VALUE; Path=/; Domain=SOME_DOMAIN; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://SOME_DOMAIN',
        {
          name: 'sess-cozy09200a3b616296ca886afa00ee4b4da5',
          value: 'SOME_VALUE',
          domain: '.SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should handle 'cozysessid' named cookies on nested domains`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString =
        'cozysessid=SOME_VALUE; Path=/; Domain=SOME_DOMAIN; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://SOME_DOMAIN',
        {
          name: 'cozysessid',
          value: 'SOME_VALUE',
          domain: '.SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should set HttpOnly to 'false' if the cookie does not contain the flag`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString =
        'cozysessid=SOME_VALUE; Path=/; Domain=SOME_DOMAIN; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://SOME_DOMAIN',
        {
          name: 'cozysessid',
          value: 'SOME_VALUE',
          domain: '.SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: false,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should set Path to '/' if the cookie does not contain the flag`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString =
        'cozysessid=SOME_VALUE; Domain=SOME_DOMAIN; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://SOME_DOMAIN',
        {
          name: 'cozysessid',
          value: 'SOME_VALUE',
          domain: '.SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None',
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })

    it(`should throw if no cookie name=value is defined`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString = 'Domain=SOME_DOMAIN; HttpOnly; SameSite=None'

      await expect(setCookie(cookieString, client)).rejects.toThrow(
        'Specified cookie does not contain any name=value'
      )
    })

    it(`should throw if no cookie domain is defined`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://SOME_DOMAIN'
      }))

      const cookieString = 'cozysessid=SOME_VALUE; HttpOnly; SameSite=None'

      await expect(setCookie(cookieString, client)).rejects.toThrow(
        'Specified cookie does not contain any domain'
      )
    })

    it(`should save cookie into AsyncStorage`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io'
      }))

      const cookieString =
        'cozysessid=AAAAAGJ3Ojku0Nzk4YzhlNWQ1ODkTc2tq3IuDMgJZTZhME3MTQ3OT3ODA3YU0MTYwgeWmEE3IsoDkhQcjx0zh-2lpoItEDU8; Path=/; Domain=cozy.10-0-2-2.nip.io; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(storeData).toHaveBeenCalledWith(CozyPersistedStorageKeys.Cookie, {
        'http://cozy.10-0-2-2.nip.io': {
          name: 'cozysessid',
          expires: tenYearsAfterMockedDate,
          value:
            'AAAAAGJ3Ojku0Nzk4YzhlNWQ1ODkTc2tq3IuDMgJZTZhME3MTQ3OT3ODA3YU0MTYwgeWmEE3IsoDkhQcjx0zh-2lpoItEDU8',
          domain: '.cozy.10-0-2-2.nip.io',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
        }
      })
    })

    it(`should set cookie expiration to 10 years from now`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io'
      }))

      const cookieString =
        'cozysessid=AAAAAGJ3Ojku0Nzk4YzhlNWQ1ODkTc2tq3IuDMgJZTZhME3MTQ3OT3ODA3YU0MTYwgeWmEE3IsoDkhQcjx0zh-2lpoItEDU8; Path=/; Domain=cozy.10-0-2-2.nip.io; HttpOnly; SameSite=None'

      await setCookie(cookieString, client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://cozy.10-0-2-2.nip.io',
        {
          name: expect.anything(),
          value: expect.anything(),
          domain: expect.anything(),
          path: expect.anything(),
          version: expect.anything(),
          secure: expect.anything(),
          httpOnly: expect.anything(),
          sameSite: expect.anything(),
          expires: tenYearsAfterMockedDate
        },
        true
      )
    })
  })
  describe('getCookie', () => {
    it(`should get cookie from AsyncStorage`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://claude.mycozy.cloud'
      }))

      getData.mockResolvedValue(MOCK_LOCAl_STORAGE)

      const result = await getCookie(client)

      expect(result).toStrictEqual({
        name: 'SOME_COOKIE_NAME',
        value: 'SOME_COOKIE_VALUE',
        domain: '.SOME_COOKIE_DOMAIN',
        path: '/',
        version: '1',
        secure: false,
        httpOnly: true,
        sameSite: 'None'
      })
    })

    it(`should get undefined cookie if no correspondig cookie exists in AsyncStorage`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://not_exsting_domain.mycozy.cloud'
      }))

      getData.mockResolvedValue(MOCK_LOCAl_STORAGE)

      const result = await getCookie(client)

      expect(result).toBe(undefined)
    })

    it(`should handle undefined AsyncStorage by returning undefined cookie`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://not_exsting_domain.mycozy.cloud'
      }))

      getData.mockResolvedValue(undefined)

      const result = await getCookie(client)

      expect(result).toBe(undefined)
    })
  })

  describe('resyncCookies', () => {
    it(`should resyncCookies cookie from AsyncStorage`, async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://claude.mycozy.cloud'
      }))

      getData.mockResolvedValue(MOCK_LOCAl_STORAGE)

      await resyncCookies(client)

      expect(CookieManager.set).toHaveBeenCalledWith(
        'http://claude.mycozy.cloud',
        {
          name: 'SOME_COOKIE_NAME',
          value: 'SOME_COOKIE_VALUE',
          domain: '.SOME_COOKIE_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
        },
        true
      )
    })
  })
})

const MOCK_LOCAl_STORAGE = {
  'http://claude.mycozy.cloud': {
    name: 'SOME_COOKIE_NAME',
    value: 'SOME_COOKIE_VALUE',
    domain: '.SOME_COOKIE_DOMAIN',
    path: '/',
    version: '1',
    secure: false,
    httpOnly: true,
    sameSite: 'None'
  }
}
