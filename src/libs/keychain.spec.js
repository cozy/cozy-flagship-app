jest.mock('react-native-keychain')

import * as Keychain from 'react-native-keychain'

import {
  saveCredential,
  getCredential,
  getSlugAccountIds,
  GLOBAL_KEY,
  saveVaultInformation,
  getVaultInformation,
  removeVaultInformation,
  getCookie,
  saveCookie,
  removeCookie,
  removeCredential
} from './keychain'

const account = {
  _id: '1',
  name: 'toto',
  password: 'tata'
}
const account2 = {
  _id: '2',
  name: 'foo',
  password: 'bar'
}
describe('keychain test suite', () => {
  beforeEach(() => {
    console.log = jest.fn() // eslint-disable-line no-console
  })
  describe('credentials API', () => {
    describe('getSlugAccountIds', () => {
      it('should get the account ids associated to a given slug and given fqdn', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
          username: GLOBAL_KEY,
          password: JSON.stringify({
            CSC_ACCOUNTS: {
              'cozy.localhost_8088': {
                5: {
                  slug: 'testslug1'
                }
              },
              'cozy.localhost_8080': {
                0: {
                  slug: 'testslug1'
                },
                1: {
                  slug: 'testslug2'
                },
                2: {
                  slug: 'testslug1'
                }
              }
            }
          })
        })
        const accountIds = await getSlugAccountIds(
          'cozy.localhost_8080',
          'testslug1'
        )
        expect(accountIds).toStrictEqual(['0', '2'])
      })
    })
    it('should get credentials', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(false)
      const cred = await getCredential('cozy.localhost_8080', account)
      expect(cred).toBe(null)
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          CSC_ACCOUNTS: {
            'cozy.localhost_8080': {
              1: {
                ...account
              }
            }
          }
        })
      })
      const cred2 = await getCredential('cozy.localhost_8080', account)
      expect(cred2).toEqual(account)
    })

    it('returns the right cred even if there are several creds', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          CSC_ACCOUNTS: {
            'cozy.localhost_8088': {
              2: {
                ...account2
              }
            },
            'cozy.localhost_8080': {
              1: {
                ...account
              },
              2: {
                ...account2
              }
            }
          }
        })
      })
      const cred2 = await getCredential('cozy.localhost_8080', account2)
      expect(cred2).toEqual(account2)
    })

    it('adds a credential when there is no cred yet', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(false)
      await saveCredential('cozy.localhost_8080', account)
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          CSC_ACCOUNTS: {
            'cozy.localhost_8080': {
              1: {
                ...account
              }
            }
          }
        })
      )
    })

    it('adds a new credential', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          CSC_ACCOUNTS: {
            'cozy.localhost_8080': {
              1: {
                ...account
              }
            }
          }
        })
      })
      await saveCredential('cozy.localhost_8080', account2)
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          CSC_ACCOUNTS: {
            'cozy.localhost_8080': {
              1: {
                ...account
              },
              2: {
                ...account2
              }
            }
          }
        })
      )
    })
    it('removes a given credential with fqdn', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          CSC_ACCOUNTS: {
            'cozy.localhost_8080': {
              1: {
                ...account
              }
            }
          }
        })
      })
      await removeCredential('cozy.localhost_8080', account)
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          CSC_ACCOUNTS: {
            'cozy.localhost_8080': {}
          }
        })
      )
    })
  })

  describe('vault API', () => {
    it('add a key/value in the vault keychain even if the vault is empty', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(false)
      await saveVaultInformation('key', 'value')
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          VAULT: { key: 'value' }
        })
      )
    })

    it('add a key/value in the vault keychain is other values are there', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          VAULT: { key: 'value' }
        })
      })
      await saveVaultInformation('key2', 'value2')
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          VAULT: { key: 'value', key2: 'value2' }
        })
      )
    })
    it('should return null if we try to access empty vault', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(false)
      const vaultInfo = await getVaultInformation('key')
      expect(vaultInfo).toBe(null)
    })

    it('should return the value for the key if the key is there', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          VAULT: { key: 'value' }
        })
      })
      const vaultInfo = await getVaultInformation('key')
      expect(vaultInfo).toBe('value')
    })

    it('should remove the value for the key if the key is there', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          VAULT: { key: 'value' }
        })
      })
      await removeVaultInformation('key')
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          VAULT: {}
        })
      )
    })
  })

  describe('cookie API', () => {
    describe('getCookie', () => {
      it('should return the cookie with the given name if found in the keychain', async () => {
        const keychainContent = {
          CSC_COOKIES: {
            SOME_ACCOUNT_ID: [
              {
                value: 'tokenvalue',
                name: 'SOME_COOKIE_NAME',
                path: null,
                httpOnly: true,
                secure: true
              }
            ]
          }
        }
        jest
          .spyOn(Keychain, 'getGenericPassword')
          .mockResolvedValueOnce({ password: JSON.stringify(keychainContent) })

        const result = await getCookie({
          accountId: 'SOME_ACCOUNT_ID',
          cookieName: 'SOME_COOKIE_NAME'
        })
        expect(result).toStrictEqual({
          value: 'tokenvalue',
          name: 'SOME_COOKIE_NAME',
          path: null,
          httpOnly: true,
          secure: true
        })
      })
      it('should return the right cookie with the given name', async () => {
        const keychainContent = {
          CSC_COOKIES: {
            SOME_ACCOUNT_ID: [
              {
                value: 'cookievalue',
                name: 'ANOTHER_COOKIE_NAME',
                path: null,
                httpOnly: true,
                secure: true
              },
              {
                value: 'tokenvalue',
                name: 'SOME_COOKIE_NAME',
                path: null,
                httpOnly: true,
                secure: true
              }
            ],
            SOME_OTHER_ACCOUNT_ID: [
              {
                value: 'cookievalue',
                name: 'ANOTHER_COOKIE_NAME_2',
                path: null,
                httpOnly: true,
                secure: true
              }
            ]
          }
        }
        jest
          .spyOn(Keychain, 'getGenericPassword')
          .mockResolvedValueOnce({ password: JSON.stringify(keychainContent) })

        const result = await getCookie({
          accountId: 'SOME_ACCOUNT_ID',
          cookieName: 'SOME_COOKIE_NAME'
        })
        expect(result).toStrictEqual({
          value: 'tokenvalue',
          name: 'SOME_COOKIE_NAME',
          path: null,
          httpOnly: true,
          secure: true
        })
      })
      it('should return null if no account found for given accountId', async () => {
        const keychainContent = {
          CSC_COOKIES: {
            SOME_OTHER_ACCOUNT_ID: [
              {
                value: 'cookievalue',
                name: 'ANOTHER_COOKIE_NAME_2',
                path: null,
                httpOnly: true,
                secure: true
              }
            ]
          }
        }
        jest
          .spyOn(Keychain, 'getGenericPassword')
          .mockResolvedValueOnce({ password: JSON.stringify(keychainContent) })

        const result = await getCookie({
          accountId: 'SOME_ACCOUNT_ID',
          cookieName: 'SOME_COOKIE_NAME'
        })
        expect(result).toBeNull()
      })
      it('should return null if no cookie found with given cookieName', async () => {
        const keychainContent = {
          CSC_COOKIES: {
            SOME_ACCOUNT_ID: [
              {
                value: 'cookievalue',
                name: 'ANOTHER_COOKIE_NAME',
                path: null,
                httpOnly: true,
                secure: true
              }
            ]
          }
        }
        jest
          .spyOn(Keychain, 'getGenericPassword')
          .mockResolvedValueOnce({ password: JSON.stringify(keychainContent) })

        const result = await getCookie({
          accountId: 'SOME_ACCOUNT_ID',
          cookieName: 'SOME_COOKIE_NAME'
        })
        expect(result).toBeNull()
      })
      it('should throw an Error if no cookieName is given', async () => {
        const keychainContent = {
          CSC_COOKIES: {
            SOME_ACCOUNT_ID: [
              {
                value: 'tokenvalue',
                name: 'SOME_COOKIE_NAME',
                path: null,
                httpOnly: true,
                secure: true
              }
            ]
          }
        }
        jest
          .spyOn(Keychain, 'getGenericPassword')
          .mockResolvedValueOnce({ password: JSON.stringify(keychainContent) })

        await expect(
          getCookie({
            accountId: 'SOME_ACCOUNT_ID',
            cookieName: ''
          })
        ).rejects.toThrow('getCookie cannot be called without a cookieName')
      })
    })
    describe('saveCookie', () => {
      it('should save the given cookie', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(null)
        const cookieToAdd = {
          accountId: 'SOME_ACCOUNT_ID',
          cookieObject: {
            value: 'SOME_COOKIE_VALUE',
            name: 'SOME_COOKIE_NAME',
            path: null,
            httpOnly: true,
            secure: true
          }
        }
        await saveCookie(cookieToAdd)
        expect(Keychain.setGenericPassword).toBeCalledWith(
          GLOBAL_KEY,
          JSON.stringify({
            CSC_COOKIES: {
              SOME_ACCOUNT_ID: [
                {
                  value: 'SOME_COOKIE_VALUE',
                  name: 'SOME_COOKIE_NAME',
                  path: null,
                  httpOnly: true,
                  secure: true
                }
              ]
            }
          })
        )
      })
      it('should save the given cookie when keychain is already filled up', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
          password: JSON.stringify({
            VAULT: { key: 'value' }
          })
        })
        const cookieToAdd = {
          accountId: 'SOME_ACCOUNT_ID',
          cookieObject: {
            value: 'SOME_COOKIE_VALUE',
            name: 'SOME_COOKIE_NAME',
            path: null,
            httpOnly: true,
            secure: true
          }
        }
        await saveCookie(cookieToAdd)
        expect(Keychain.setGenericPassword).toBeCalledWith(
          GLOBAL_KEY,
          JSON.stringify({
            VAULT: { key: 'value' },
            CSC_COOKIES: {
              SOME_ACCOUNT_ID: [
                {
                  value: 'SOME_COOKIE_VALUE',
                  name: 'SOME_COOKIE_NAME',
                  path: null,
                  httpOnly: true,
                  secure: true
                }
              ]
            }
          })
        )
      })
      it('should save the given cookie when keychain already has some cookies for the given konnector accountId', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
          password: JSON.stringify({
            CSC_COOKIES: {
              SOME_ACCOUNT_ID: [
                {
                  value: 'SOME_EXISTING_COOKIE_VALUE',
                  name: 'SOME_EXISTING_COOKIE_NAME',
                  path: null,
                  httpOnly: true,
                  secure: true
                }
              ]
            }
          })
        })
        const cookieToAdd = {
          accountId: 'SOME_ACCOUNT_ID',
          cookieObject: {
            value: 'SOME_COOKIE_VALUE',
            name: 'SOME_COOKIE_NAME',
            path: null,
            httpOnly: true,
            secure: true
          }
        }
        await saveCookie(cookieToAdd)
        expect(Keychain.setGenericPassword).toBeCalledWith(
          GLOBAL_KEY,
          JSON.stringify({
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
                  value: 'SOME_COOKIE_VALUE',
                  name: 'SOME_COOKIE_NAME',
                  path: null,
                  httpOnly: true,
                  secure: true
                }
              ]
            }
          })
        )
      })
      it('should throw an Error if the given cookie is already saved', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
          password: JSON.stringify({
            CSC_COOKIES: {
              SOME_ACCOUNT_ID: [
                {
                  value: 'SOME_EXISTING_COOKIE_VALUE',
                  name: 'SOME_EXISTING_COOKIE_NAME',
                  path: null,
                  httpOnly: true,
                  secure: true
                }
              ]
            }
          })
        })
        const cookieToAdd = {
          accountId: 'SOME_ACCOUNT_ID',
          cookieObject: {
            value: 'SOME_COOKIE_VALUE',
            name: 'SOME_EXISTING_COOKIE_NAME',
            path: null,
            httpOnly: true,
            secure: true
          }
        }
        await expect(saveCookie(cookieToAdd)).rejects.toThrow(
          "Cookie SOME_EXISTING_COOKIE_NAME is already saved in SOME_ACCOUNT_ID. You can't add it again."
        )
      })
    })
    describe('removeCookie', () => {
      it('should remove cookies from the given account id', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
          password: JSON.stringify({
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
                }
              ]
            }
          })
        })
        await removeCookie('SOME_ACCOUNT_ID', 'SOME_EXISTING_COOKIE_NAME')
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
                }
              ]
            }
          })
        )
      })
      it('should not modify the saved keychain if the given account id doesnt exist', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
          password: JSON.stringify({
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
                }
              ]
            }
          })
        })
        await removeCookie(
          'SOME_NOT_EXISTING_ACCOUNT_ID',
          'SOME_EXISTING_COOKIE_NAME'
        )
        expect(Keychain.setGenericPassword).toBeCalledWith(
          GLOBAL_KEY,
          JSON.stringify({
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
                }
              ]
            }
          })
        )
      })
      it('should not modify the saved keychain if the keychain does not contain any cookie', async () => {
        jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
          password: JSON.stringify({
            VAULT: { key: 'value' }
          })
        })
        await removeCookie('SOME_ACCOUNT_ID')
        expect(Keychain.setGenericPassword).toBeCalledWith(
          GLOBAL_KEY,
          JSON.stringify({
            VAULT: { key: 'value' }
          })
        )
      })
    })
  })
})
