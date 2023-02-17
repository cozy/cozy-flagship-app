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
jest.mock('./keychain', () => {
  return {
    getCookie: jest.fn(),
    saveCookie: jest.fn(),
    removeCookie: jest.fn()
  }
})
import { getCookie, saveCookie, removeCookie } from './keychain'
import CookieManager from '@react-native-cookies/cookies'
import ReactNativeLauncher from './ReactNativeLauncher'

const fixtures = {
  job: { _id: 'normal_job_id' },
  account: { _id: 'normal_account_id' },
  trigger: {
    _id: 'normal_trigger_id',
    message: { folder_to_save: 'normalfolderid' }
  }
}

describe('ReactNativeLauncher', () => {
  function setup() {
    const launcher = new ReactNativeLauncher()
    launcher.pilot = {
      call: jest.fn()
    }
    launcher.worker = {
      call: jest.fn()
    }
    const updateAttributes = jest.fn()
    const launch = jest.fn()
    const client = {
      save: jest.fn(),
      create: jest.fn(),
      query: jest.fn(),
      collection: () => ({
        updateAttributes,
        launch
      })
    }
    return { launcher, updateAttributes, launch, client }
  }

  beforeEach(() => {
    console.log = jest.fn() // eslint-disable-line no-console
  })

  describe('start', () => {
    it('should ensure account and trigger', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        connector: { slug: 'connectorslug', clientSide: true }
      })
      client.save
        .mockResolvedValueOnce({ data: fixtures.account })
        .mockResolvedValueOnce({ data: fixtures.trigger })
      launch.mockResolvedValue({ data: fixtures.job })
      client.query.mockResolvedValue({ data: fixtures.account })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
      await launcher.start()
      expect(client.save).toHaveBeenNthCalledWith(1, {
        _type: 'io.cozy.accounts',
        account_type: 'connectorslug',
        auth: {},
        identifier: null,
        state: null
      })
      expect(client.save).toHaveBeenNthCalledWith(2, {
        _type: 'io.cozy.triggers',
        type: '@client',
        worker: 'konnector',
        message: {
          account: 'normal_account_id',
          konnector: 'connectorslug'
        }
      })
      expect(launch).toHaveBeenCalledTimes(1)
    })
    it('should launch the given trigger if any', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        connector: { slug: 'connectorslug', clientSide: true }
      })
      launch.mockResolvedValue({ data: fixtures.job })
      client.query.mockResolvedValue({ data: fixtures.account })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
      await launcher.start()
      expect(launch).toHaveBeenCalledTimes(1)
    })
    it('should work normaly in nominal case', async () => {
      const { launcher, client, launch, updateAttributes } = setup()
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        connector: { slug: 'connectorslug', clientSide: true }
      })
      client.query.mockResolvedValue({ data: fixtures.account })
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
      await launcher.start()
      expect(client.save).toHaveBeenNthCalledWith(1, {
        _id: 'normal_account_id',
        state: 'LOGIN_SUCCESS'
      })
      expect(client.save).toHaveBeenNthCalledWith(2, {
        _id: 'normal_account_id',
        auth: {
          accountName: 'testsourceaccountidentifier'
        }
      })
      expect(client.save).toHaveBeenNthCalledWith(3, {
        _id: 'normal_job_id',
        attributes: {
          state: 'done'
        }
      })
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        1,
        'setContentScriptType',
        'pilot'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        2,
        'ensureAuthenticated'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        3,
        'getUserDataFromWebsite'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(4, 'fetch', [])
      expect(updateAttributes).toHaveBeenNthCalledWith(1, 'normalfolderid', {
        name: 'testsourceaccountidentifier'
      })
    })
    it('should update job with error message on error', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger
      })
      client.query.mockResolvedValue({ data: fixtures.account })
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call.mockRejectedValue(new Error('test error message'))
      await launcher.start()
      expect(client.save).toHaveBeenNthCalledWith(1, {
        _id: 'normal_job_id',
        attributes: {
          state: 'errored',
          error: 'test error message'
        }
      })
    })
    it('should not create account and trigger if the user stops the execution before login success', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        connector: { slug: 'connectorslug', clientSide: true }
      })
      launcher.pilot.call.mockImplementation(() => {
        return new Promise(() => {
          return
        })
      })
      await Promise.all([launcher.start(), launcher.stop()])

      expect(client.create).not.toHaveBeenCalled()
      expect(launch).not.toHaveBeenCalled()
    })
  })
  describe('runInWorker', () => {
    it('should resolve with method result', async () => {
      const { launcher } = setup()
      launcher.worker.call.mockResolvedValue('worker result')
      const result = await launcher.runInWorker('toRunInworker')
      expect(launcher.worker.call).toHaveBeenCalledTimes(1)
      expect(result).toEqual('worker result')
    })
    it('should return false WORKER_WILL_RELOAD event is emitted', async () => {
      const { launcher } = setup()
      launcher.worker.call.mockImplementation(async () => {
        launcher.emit('WORKER_WILL_RELOAD')
        launcher.emit('WORKER_RELOADED')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      const result = await launcher.runInWorker('toRunInworker')
      expect(result).toEqual(false)
    })
  })
  describe('getCookiesByDomain', () => {
    it('should return cookies from CookieManager', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({ value: 'SOME COOKIE' })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {
          cookie_domains: ['.cozy.io']
        }
      })
      const result = await launcher.getCookiesByDomain('.cozy.io')
      expect(result).toStrictEqual({ value: 'SOME COOKIE' })
      expect(CookieManager.get).toHaveBeenCalledWith('.cozy.io')
    })
    it('should throw error if cookie_domains does not exist', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({ value: 'SOME COOKIE' })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {}
      })
      await expect(launcher.getCookiesByDomain('.cozy.io')).rejects.toThrow(
        'getCookiesByDomain cannot be called without cookie_domains declared in manifest'
      )
    })
    it('should throw error if cookie_domains does not declare requested domain', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({ value: 'SOME COOKIE' })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {
          cookie_domains: ['.somedomain']
        }
      })
      await expect(launcher.getCookiesByDomain('.cozy.io')).rejects.toThrow(
        'Cookie domain .cozy.io not declared in the manifest'
      )
    })
    it('should return empty object if CookieManager return no cookies', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({})
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {
          cookie_domains: ['apeculiarsite.com']
        }
      })
      const result = await launcher.getCookiesByDomain('apeculiarsite.com')
      expect(result).toStrictEqual({})
    })
  })
  describe('getCookieByDomainAndName', () => {
    it('should return cookie from CookieManager', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({
        SOME_COOKIE_NAME: 'SOME COOKIE VALUE',
        SOME_COOKIE_NAME_2: 'SOME COOKIE VALUE_2'
      })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {
          cookie_domains: ['.cozy.io']
        }
      })
      const result = await launcher.getCookieByDomainAndName(
        '.cozy.io',
        'SOME_COOKIE_NAME'
      )
      expect(result).toStrictEqual('SOME COOKIE VALUE')
      expect(CookieManager.get).toHaveBeenCalledWith('.cozy.io')
    })
    it('should throw error if cookie_domains does not exist', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({
        SOME_COOKIE_NAME: 'SOME COOKIE VALUE',
        SOME_COOKIE_NAME_2: 'SOME COOKIE VALUE_2'
      })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {}
      })
      await expect(
        launcher.getCookieByDomainAndName('.cozy.io', 'SOME_COOKIE_NAME')
      ).rejects.toThrow(
        'getCookiesByDomain cannot be called without cookie_domains declared in manifest'
      )
    })
    it('should throw error if cookie_domains does not declare requested domain', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({
        SOME_COOKIE_NAME: 'SOME COOKIE VALUE',
        SOME_COOKIE_NAME_2: 'SOME COOKIE VALUE_2'
      })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {
          cookie_domains: ['.somedomain']
        }
      })
      await expect(
        launcher.getCookieByDomainAndName('.cozy.io', 'SOME_COOKIE_NAME')
      ).rejects.toThrow('Cookie domain .cozy.io not declared in the manifest')
    })
    it('should return null if CookieManager does not contain the requested cookie', async () => {
      const { launcher } = setup()
      CookieManager.get.mockResolvedValue({
        SOME_COOKIE_NAME: 'SOME COOKIE VALUE',
        SOME_COOKIE_NAME_2: 'SOME COOKIE VALUE_2'
      })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        },
        manifest: {
          cookie_domains: ['apeculiarsite.com']
        }
      })
      const result = await launcher.getCookieByDomainAndName(
        'apeculiarsite.com',
        'SOME_NON_EXISTING_COOKIE_NAME'
      )
      expect(result).toBeNull()
    })
  })
  describe('getCookieFromKeychainByName', () => {
    it('should return cookie with given name', async () => {
      const { launcher } = setup()
      getCookie.mockResolvedValue({
        value: 'tokenvalue',
        name: 'token',
        path: null,
        httpOnly: true,
        secure: true
      })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        }
      })
      const result = await launcher.getCookieFromKeychainByName('token')
      expect(result).toEqual({
        value: 'tokenvalue',
        name: 'token',
        path: null,
        httpOnly: true,
        secure: true
      })
      expect(getCookie).toHaveBeenCalledWith({
        accountId: 'cozyKonnector',
        cookieName: 'token'
      })
    })
    it('should return null if there is no cookie with given name', async () => {
      const { launcher } = setup()
      getCookie.mockResolvedValue(null)
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        }
      })
      const result = await launcher.getCookieFromKeychainByName('token')
      expect(result).toBeNull()
    })
  })
  describe('saveCookieToKeychain', () => {
    it('should save given cookie into the keychain', async () => {
      const { launcher } = setup()
      getCookie.mockResolvedValue(null)
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        }
      })
      await launcher.saveCookieToKeychain({
        value: 'tokenvalue',
        name: 'token',
        path: null,
        httpOnly: true,
        secure: true
      })
      expect(getCookie).toHaveBeenCalledWith({
        accountId: 'cozyKonnector',
        cookieName: 'token'
      })
      expect(removeCookie).not.toHaveBeenCalled()
      expect(saveCookie).toHaveBeenCalledWith({
        accountId: 'cozyKonnector',
        cookieObject: {
          value: 'tokenvalue',
          name: 'token',
          path: null,
          httpOnly: true,
          secure: true
        }
      })
    })
    it('should override the cookie if the cookie with given name is already saved in the keychain', async () => {
      const { launcher } = setup()
      getCookie.mockResolvedValue({
        value: 'tokenvalue',
        name: 'token',
        path: null,
        httpOnly: true,
        secure: true
      })
      launcher.setStartContext({
        account: {
          id: 'cozyKonnector'
        }
      })
      await launcher.saveCookieToKeychain({
        value: 'tokenvalue',
        name: 'token',
        path: null,
        httpOnly: true,
        secure: true
      })
      expect(getCookie).toHaveBeenCalledWith({
        accountId: 'cozyKonnector',
        cookieName: 'token'
      })
      expect(removeCookie).toHaveBeenCalledWith('cozyKonnector', 'token')
      expect(saveCookie).toHaveBeenCalledWith({
        accountId: 'cozyKonnector',
        cookieObject: {
          value: 'tokenvalue',
          name: 'token',
          path: null,
          httpOnly: true,
          secure: true
        }
      })
    })
  })
})
