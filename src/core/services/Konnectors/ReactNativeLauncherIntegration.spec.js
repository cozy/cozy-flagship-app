jest.mock('react-native-keychain')

jest.mock('react-native-fs', () => {
  return {}
})
jest.mock('@fengweichong/react-native-gzip', () => {
  return {}
})
jest.mock('@react-native-cookies/cookies', () => {
  return {
    get: jest.fn()
  }
})

import * as Keychain from 'react-native-keychain'

import ReactNativeLauncher from '../core/services/Connectors/ReactNativeLauncher'
import { GLOBAL_KEY } from '../core/services/Session/keychain'

describe('ReactNativeLauncherIntegration', () => {
  const launcher = new ReactNativeLauncher()
  launcher.pilot = {
    call: jest.fn()
  }
  launcher.worker = {
    call: jest.fn()
  }

  beforeEach(() => {
    console.log = jest.fn() // eslint-disable-line no-console
  })

  describe('saveCookieToKeychain', () => {
    it('should override the cookie if the cookie with given name is already saved in the keychain but do not remove all the others', async () => {
      const initialCookies = {
        CSC_COOKIES: {
          SOME_ACCOUNT_ID: [
            {
              value: 'SOME_EXISTING_COOKIE_VALUE',
              name: 'SOME_EXISTING_COOKIE_NAME',
              path: null,
              httpOnly: true,
              secure: true
            },
            {
              value: 'SOME_EXISTING_COOKIE_VALUE_2',
              name: 'SOME_EXISTING_COOKIE_NAME_2',
              path: null,
              httpOnly: true,
              secure: true
            },
            {
              value: 'SOME_EXISTING_COOKIE_VALUE_3',
              name: 'SOME_EXISTING_COOKIE_NAME_3',
              path: null,
              httpOnly: true,
              secure: true
            }
          ]
        }
      }
      const cookiesAfterDeletion = {
        CSC_COOKIES: {
          SOME_ACCOUNT_ID: [
            {
              value: 'SOME_EXISTING_COOKIE_VALUE_2',
              name: 'SOME_EXISTING_COOKIE_NAME_2',
              path: null,
              httpOnly: true,
              secure: true
            },
            {
              value: 'SOME_EXISTING_COOKIE_VALUE_3',
              name: 'SOME_EXISTING_COOKIE_NAME_3',
              path: null,
              httpOnly: true,
              secure: true
            }
          ]
        }
      }
      jest
        .spyOn(Keychain, 'getGenericPassword')
        .mockResolvedValueOnce({
          password: JSON.stringify(initialCookies)
        })
        .mockResolvedValueOnce({
          password: JSON.stringify(initialCookies)
        })
        .mockResolvedValueOnce({
          password: JSON.stringify(cookiesAfterDeletion)
        })
      launcher.setStartContext({
        account: {
          id: 'SOME_ACCOUNT_ID'
        }
      })
      await launcher.saveCookieToKeychain({
        value: 'SOME_NEW_COOKIE_VALUE',
        name: 'SOME_EXISTING_COOKIE_NAME',
        path: null,
        httpOnly: true,
        secure: true
      })
      expect(Keychain.setGenericPassword).toBeCalledWith(
        GLOBAL_KEY,
        JSON.stringify(cookiesAfterDeletion)
      )
      expect(Keychain.setGenericPassword).toBeCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          CSC_COOKIES: {
            SOME_ACCOUNT_ID: [
              {
                value: 'SOME_EXISTING_COOKIE_VALUE_2',
                name: 'SOME_EXISTING_COOKIE_NAME_2',
                path: null,
                httpOnly: true,
                secure: true
              },
              {
                value: 'SOME_EXISTING_COOKIE_VALUE_3',
                name: 'SOME_EXISTING_COOKIE_NAME_3',
                path: null,
                httpOnly: true,
                secure: true
              },
              {
                value: 'SOME_NEW_COOKIE_VALUE',
                name: 'SOME_EXISTING_COOKIE_NAME',
                path: null,
                httpOnly: true,
                secure: true
              }
            ]
          }
        })
      )
    })
  })
})
