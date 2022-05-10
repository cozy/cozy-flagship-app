import CookieManager from '@react-native-cookies/cookies'

import { createMockClient } from 'cozy-client/dist/mock'

import { setCookie } from './httpCookieManager'

jest.mock('@react-native-cookies/cookies', () => ({
  set: jest.fn()
}))

jest.mock('cozy-client', () => ({
  ...jest.requireActual('cozy-client'),
  useAppsInMaintenance: jest.fn()
}))

describe('httpCookieManager', () => {
  const client = createMockClient({})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('setCookie', () => {
    it(`should set cookie from parsted string`, async () => {
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
          domain: 'cozy.10-0-2-2.nip.io',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
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
          domain: 'SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
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
          domain: 'SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
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
          domain: 'SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: true,
          httpOnly: true,
          sameSite: 'None'
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
          domain: 'SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
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
          domain: 'SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
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
          domain: 'SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: false,
          sameSite: 'None'
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
          domain: 'SOME_DOMAIN',
          path: '/',
          version: '1',
          secure: false,
          httpOnly: true,
          sameSite: 'None'
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
  })
})
