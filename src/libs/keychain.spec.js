const mockSetGenericPassword = jest.fn().mockResolvedValue([])
const mockGetGenericPassword = jest.fn().mockResolvedValue([])
jest.mock('react-native-keychain')

import * as Keychain from 'react-native-keychain'

import {
  saveCredential,
  getCredential,
  removeCredential,
  GLOBAL_KEY,
  VAULT_SCOPE,
  saveVaultInformation,
  getVaultInformation,
  CREDENTIALS_SCOPE,
  removeVaultInformation,
} from './keychain'

const account = {
  _id: '1',
  name: 'toto',
  password: 'tata',
}
const account2 = {
  _id: '2',
  name: 'foo',
  password: 'bar',
}
describe('keychain test suite', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('credantials API', () => {
    it('test get credentials methods', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(false)
      //  mockGetGenericPassword.mockResolvedValue([])
      const cred = await getCredential(account)
      expect(cred).toBe(null)
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          CSC_ACCOUNTS: {
            1: {
              ...account,
            },
          },
        }),
      })
      const cred2 = await getCredential(account)
      expect(cred2).toEqual(account)
    })

    it('returns the right cred even if there is several creds', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          CSC_ACCOUNTS: {
            1: {
              ...account,
            },
            2: {
              ...account2,
            },
          },
        }),
      })
      const cred2 = await getCredential(account2)
      expect(cred2).toEqual(account2)
    })

    it('add a credential when there is no cred yet', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(false)
      await saveCredential(account)
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          CSC_ACCOUNTS: {
            1: {
              ...account,
            },
          },
        }),
      )
    })

    it('adds a new credentials', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          CSC_ACCOUNTS: {
            1: {
              ...account,
            },
          },
        }),
      })
      await saveCredential(account2)
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          CSC_ACCOUNTS: {
            1: {
              ...account,
            },
            2: {
              ...account2,
            },
          },
        }),
      )
    })
  })

  describe('vault api', () => {
    it('add a key/value in the vault keychain even if the vault is empty', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce(false)
      await saveVaultInformation('key', 'value')
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          VAULT: {key: 'value'},
        }),
      )
    })

    it('add a key/value in the vault keychain is other values are there', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          VAULT: {key: 'value'},
        }),
      })
      await saveVaultInformation('key2', 'value2')
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          VAULT: {key: 'value', key2: 'value2'},
        }),
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
          VAULT: {key: 'value'},
        }),
      })
      const vaultInfo = await getVaultInformation('key')
      expect(vaultInfo).toBe('value')
    })

    it('should remove the value for the key if the key is there', async () => {
      jest.spyOn(Keychain, 'getGenericPassword').mockResolvedValueOnce({
        username: GLOBAL_KEY,
        password: JSON.stringify({
          VAULT: {key: 'value'},
        }),
      })
      await removeVaultInformation('key')
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        GLOBAL_KEY,
        JSON.stringify({
          VAULT: {},
        }),
      )
    })
  })
})
