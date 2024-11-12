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
    removeCookie: jest.fn(),
    getSlugAccountIds: jest.fn(),
    removeCredential: jest.fn()
  }
})
jest.mock('cozy-flags/dist/flag')
import CookieManager from '@react-native-cookies/cookies'
import { waitFor } from '@testing-library/react-native'

import ReactNativeLauncher, {
  launcherEvent,
  ERRORS
} from './ReactNativeLauncher'
import {
  getCookie,
  saveCookie,
  removeCookie,
  getSlugAccountIds,
  removeCredential
} from './keychain'

const fixtures = {
  job: { _id: 'normal_job_id' },
  account: {
    _id: 'normal_account_id',
    auth: { accountName: 'testsourceaccountidentifier' }
  },
  trigger: {
    _id: 'normal_trigger_id',
    message: { folder_to_save: 'testfolderid' }
  }
}

describe('ReactNativeLauncher', () => {
  function setup() {
    jest.spyOn(launcherEvent, 'emit')
    const launcher = new ReactNativeLauncher()
    launcher.setLogger(() => {})
    launcher.pilot = {
      call: jest.fn(),
      close: jest.fn()
    }
    launcher.worker = {
      call: jest.fn(),
      init: jest.fn(),
      close: jest.fn()
    }
    getSlugAccountIds.mockResolvedValue([])
    removeCredential.mockResolvedValue()
    const launch = jest.fn()
    const findReferencedBy = jest
      .fn()
      .mockResolvedValue({ data: [], included: [] })
    const ensureDirectoryExists = jest.fn()
    const addReferencesTo = jest.fn()
    const get = jest.fn().mockResolvedValue({ data: { _id: 'testfolderid' } })
    const create = jest.fn()
    const waitFor = jest.fn()
    const statByPath = jest
      .fn()
      .mockResolvedValue({ data: { _id: 'testfolderid' } })
    const statById = jest
      .fn()
      .mockResolvedValue({ data: { _id: 'testfolderid' } })
    const add = jest.fn()
    const client = {
      save: jest.fn(),
      create: jest.fn(),
      query: jest.fn(),
      queryAll: jest.fn(),
      destroy: jest.fn(),
      getStackClient: () => ({
        uri: 'http://cozy.localhost:8080'
      }),
      collection: () => ({
        launch,
        findReferencedBy,
        ensureDirectoryExists,
        addReferencesTo,
        get,
        statByPath,
        statById,
        add,
        create,
        waitFor
      }),
      getInstanceOptions: jest.fn().mockReturnValueOnce({ locale: 'fr' })
    }
    return {
      launcher,
      launch,
      client,
      findReferencedBy,
      get,
      create,
      ensureDirectoryExists,
      addReferencesTo,
      statByPath,
      add,
      waitFor
    }
  }

  beforeEach(() => {
    console.log = jest.fn() // eslint-disable-line no-console
  })

  describe('start', () => {
    it('should ensure account and trigger', async () => {
      const { launcher, client, launch } = setup()
      const konnector = {
        slug: 'konnectorslug',
        clientSide: true,
        permissions: { files: { type: 'io.cozy.files' } }
      }
      launcher.setStartContext({
        client,
        konnector,
        manifest: konnector,
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      launch.mockResolvedValue({ data: fixtures.job })
      client.query.mockResolvedValue({ data: fixtures.account, included: [] })
      client.queryAll.mockResolvedValue([])
      client.save.mockImplementation(async doc => ({
        data: { ...doc, _id: doc._id ? doc._id : 'newid' }
      }))
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
      await launcher.start()
      expect(client.save).toHaveBeenNthCalledWith(1, {
        _type: 'io.cozy.accounts',
        account_type: 'konnectorslug',
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
          konnector: 'konnectorslug',
          folder_to_save: 'testfolderid'
        }
      })
      expect(client.save).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          _type: 'io.cozy.triggers',
          type: '@in',
          worker: 'service',
          message: {
            slug: 'home',
            name: 'cliskTimeout',
            fields: {
              cliskJobId: 'normal_job_id'
            }
          }
        })
      )
      expect(launch).toHaveBeenCalledTimes(1)
    })
    it('should launch the given trigger if any', async () => {
      const { launcher, client, launch } = setup()
      const konnector = {
        slug: 'konnectorslug',
        clientSide: true,
        permissions: { files: { type: 'io.cozy.files' } }
      }
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        konnector,
        manifest: konnector,
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      launch.mockResolvedValue({ data: fixtures.job })
      client.query.mockResolvedValue({ data: fixtures.account, included: [] })
      client.queryAll.mockResolvedValue([])
      client.save.mockImplementation(async doc => ({ data: doc }))
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
      const { launcher, client, launch } = setup()
      const konnector = {
        slug: 'konnectorslug',
        clientSide: true,
        permissions: { files: { type: 'io.cozy.files' } }
      }
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        konnector,
        manifest: konnector,
        flags: {},
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      client.query.mockResolvedValue({ data: fixtures.account, included: [] })
      client.queryAll.mockResolvedValue([])
      client.save.mockImplementation(async doc => ({ data: doc }))
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
      await launcher.start()
      expect(client.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          _type: 'io.cozy.triggers',
          type: '@in',
          worker: 'service',
          message: {
            slug: 'home',
            name: 'cliskTimeout',
            fields: {
              cliskJobId: 'normal_job_id'
            }
          }
        })
      )
      expect(client.save).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          _type: 'io.cozy.triggers',
          type: '@in',
          worker: 'service',
          message: {
            slug: 'home',
            name: 'cliskTimeout',
            fields: {
              cliskJobId: 'normal_job_id'
            }
          }
        })
      )
      expect(client.save).toHaveBeenNthCalledWith(2, {
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
        'ensureAuthenticated',
        { account: fixtures.account }
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        3,
        'getUserDataFromWebsite'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(4, 'fetch', {
        account: {
          ...fixtures.account,
          auth: { accountName: 'testsourceaccountidentifier' }
        },
        trigger: fixtures.trigger,
        existingFilesIndex: {},
        job: {
          _id: 'normal_job_id'
        },
        sourceAccountIdentifier: 'testsourceaccountidentifier',
        manifest: konnector,
        flags: {}
      })
      expect(launcher.pilot.call).not.toHaveBeenCalledWith(
        'ensureNotAuthenticated'
      )
      expect(launcherEvent.emit).toHaveBeenCalledWith('launchResult', {
        cancel: true
      })
    })
    it('should display a specific error when UserData sent by the konnector is incorrect', async () => {
      const { launcher, client, launch } = setup()
      const konnector = { slug: 'konnectorslug', clientSide: true }
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        konnector,
        manifest: konnector,
        flags: {},
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      client.query.mockResolvedValue({ data: fixtures.account })
      client.save.mockImplementation(async doc => ({ data: doc }))
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(null) // getUserDataFromWebsite
      await launcher.start()
      expect(launcherEvent.emit).toHaveBeenCalledWith('launchResult', {
        errorMessage: `getUserDataFromWebsite did not return any sourceAccountIdentifier. Cannot continue the execution.`
      })
    })
    it('should send existingFilesIndex to the konnector if it has files permission', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        manifest: { permissions: { files: { type: 'io.cozy.files' } } },
        konnector: {
          slug: 'testkonnector',
          name: 'Test Konnector'
        },
        flags: {},
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      client.query.mockResolvedValue({ data: fixtures.account, included: [] })
      client.queryAll.mockResolvedValueOnce([
        {
          name: 'file1.txt',
          metadata: { fileIdAttributes: 'sourceaccountidentifier1' }
        }
      ])
      client.save.mockImplementation(async doc => ({ data: doc }))
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
        .mockResolvedValueOnce(true) // fetch
      await launcher.start()
      expect(launcher.pilot.call).toHaveBeenLastCalledWith(
        'fetch',
        expect.objectContaining({
          existingFilesIndex: {
            sourceaccountidentifier1: {
              name: 'file1.txt',
              metadata: { fileIdAttributes: 'sourceaccountidentifier1' }
            }
          }
        })
      )
    })
    it('should update job with error message on error', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        manifest: {},
        konnector: {
          slug: 'testkonnector',
          name: 'Test Konnector'
        },
        flags: {},
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      client.query.mockResolvedValue({ data: fixtures.account, included: [] })
      client.save.mockImplementation(async doc => ({ data: doc }))
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce({
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
        .mockRejectedValue(new Error('test error message'))
      await launcher.start()
      expect(client.save).toHaveBeenNthCalledWith(2, {
        _id: 'normal_job_id',
        attributes: {
          state: 'errored',
          error: 'test error message'
        }
      })
      expect(launcherEvent.emit).toHaveBeenCalledWith('launchResult', {
        cancel: true
      })
    })
    it('should not create account and trigger if the user stops the execution before login success', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        konnector: { slug: 'konnectorslug', clientSide: true },
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      launcher.pilot.call.mockImplementation(async method => {
        if (method === 'ensureAuthenticated') {
          launcher.controller.abort()
        }
        return
      })
      await Promise.all([launcher.start()])

      expect(launch).not.toHaveBeenCalled()
      expect(launcherEvent.emit).not.toHaveBeenCalledWith('loginSuccess')
    })
    it('should send error message to harvest when error occurs before loginSuccess', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        konnector: { slug: 'konnectorslug', clientSide: true },
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      launcher.pilot.call.mockImplementation(async method => {
        if (method === 'ensureAuthenticated') {
          throw new Error('test error message')
        }
        return
      })
      await launcher.start()

      expect(launch).not.toHaveBeenCalled()
      expect(launcherEvent.emit).toHaveBeenCalledWith('launchResult', {
        errorMessage: 'test error message'
      })
      expect(launcherEvent.emit).not.toHaveBeenCalledWith('loginSuccess')
    })
    it('should not send an error message to harvest when the user stops the execution of the konnector himself', async () => {
      const { launcher, client } = setup()
      launcher.setStartContext({
        client,
        konnector: { slug: 'konnectorslug', clientSide: true },
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      launcher.pilot.call.mockImplementation(async () => {
        launcher.stop({ message: 'stopped by user', invisible: true })
      })
      await launcher.start()

      expect(launcherEvent.emit).toHaveBeenCalledWith('launchResult', {
        cancel: true
      })
    })
    it('should run ensureNotAuthenticated when an account has been removed from database', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        konnector: { slug: 'konnectorslug', clientSide: true },
        flags: {},
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      getSlugAccountIds.mockResolvedValue(['testaccountid1', 'testaccountid2'])
      client.query.mockImplementation(async obj => {
        if (obj.doctype === 'io.cozy.accounts' && obj.ids) {
          return { data: [] }
        }
        return { data: fixtures.account }
      })
      client.save.mockImplementation(async doc => ({ data: doc }))
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce('0.10.0')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
      await launcher.start()
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        1,
        'setContentScriptType',
        'pilot'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(2, 'getCliskVersion')
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        3,
        'ensureNotAuthenticated'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        4,
        'ensureAuthenticated',
        { account: fixtures.account }
      )
    })
    it('should not fail when clisk version is less than 0.10.0', async () => {
      const { launcher, client, launch } = setup()
      launcher.setStartContext({
        client,
        account: fixtures.account,
        trigger: fixtures.trigger,
        konnector: { slug: 'konnectorslug', clientSide: true },
        flags: {},
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      getSlugAccountIds.mockResolvedValue(['testaccountid1', 'testaccountid2'])
      client.query.mockImplementation(async obj => {
        if (obj.doctype === 'io.cozy.accounts' && obj.ids) {
          return { data: [] }
        }
        return { data: fixtures.account }
      })
      client.save.mockImplementation(async doc => ({ data: doc }))
      launch.mockResolvedValue({ data: fixtures.job })
      launcher.pilot.call
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce('0.8.0')
        .mockResolvedValueOnce(true)
      await launcher.start()
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        1,
        'setContentScriptType',
        'pilot'
      )
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(2, 'getCliskVersion')
      expect(launcher.pilot.call).toHaveBeenNthCalledWith(
        3,
        'ensureAuthenticated',
        { account: fixtures.account }
      )
    })
    it('should raise WRONG_ACCOUNT_IDENTIFIER when the user authenticates with the wrong identifiers twice', async () => {
      const { launcher, client, launch } = setup()
      const konnector = {
        slug: 'konnectorslug',
        clientSide: true,
        permissions: { files: { type: 'io.cozy.files' } }
      }
      launcher.setStartContext({
        client,
        konnector,
        account: fixtures.account,
        trigger: fixtures.trigger,
        manifest: konnector,
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      launch.mockResolvedValue({ data: fixtures.job })
      client.query.mockResolvedValue({ data: fixtures.account, included: [] })
      client.queryAll.mockResolvedValue([])
      client.save.mockImplementation(async doc => ({
        data: { ...doc, _id: doc._id ? doc._id : 'newid' }
      }))
      launcher.pilot.call.mockImplementation(method => {
        if (method === 'getUserDataFromWebsite') {
          return { sourceAccountIdentifier: 'wrongtestsourceaccountidentifier' }
        } else {
          return true
        }
      })
      launcher.stop = jest.fn()
      await launcher.start()
      expect(launcher.pilot.call).toHaveBeenCalledWith('ensureNotAuthenticated')
      expect(launcher.stop).toHaveBeenCalledWith({
        message: 'WRONG_ACCOUNT_IDENTIFIER'
      })
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
    it('should return false when WORKER_WILL_RELOAD event is emitted', async () => {
      const { launcher } = setup()
      launcher.worker.call.mockImplementation(async () => {
        launcher.emit('WORKER_WILL_RELOAD')
        launcher.emit('WORKER_RELOADED')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      const result = await launcher.runInWorker('toRunInworker')
      expect(result).toEqual(false)
    })
    it('should throw error if any other error occured in the worker', async () => {
      const { launcher } = setup()
      launcher.worker.call.mockRejectedValue(new Error('worker error'))
      await expect(() => launcher.runInWorker('toRunInworker')).rejects.toThrow(
        'worker error'
      )
    })
  })
  describe('restartWorkerConnection', () => {
    it('should be triggered with new webview reference on NEW_WORKER_INITIALIZING event', async () => {
      const { launcher, client } = setup()
      launcher.setStartContext({
        client,
        konnector: { slug: 'konnectorslug', clientSide: true },
        launcherClient: {
          setAppMetadata: () => null
        }
      })
      launcher.initPilotContentScriptBridge = jest.fn()
      launcher.initWorkerContentScriptBridge = jest.fn()
      await launcher.init({
        bridgeOptions: {
          pilotWebView: 'pilot webview ref',
          workerWebView: 'worker webview ref'
        }
      })
      launcher.emit('NEW_WORKER_INITIALIZING', 'new worker webview ref')
      await waitFor(() => expect(launcher.worker.init).toHaveBeenCalled())
      expect(launcher.worker.close).toHaveBeenCalled()
      expect(launcher.worker.init).toHaveBeenCalledWith(
        expect.objectContaining({
          webViewRef: 'new worker webview ref'
        })
      )
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        manifest: {},
        launcherClient: {
          setAppMetadata: () => null
        }
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        manifest: {},
        launcherClient: {
          setAppMetadata: () => null
        }
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
        },
        launcherClient: {
          setAppMetadata: () => null
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
  describe('setWorkerState', () => {
    it('should resolve when the webview is ready if reloaded', async () => {
      const { launcher } = setup()
      const promise = launcher.setWorkerState({ url: 'https://cozy.io' })
      launcher.emit('worker:webview:ready')
      expect(await promise).toBe(undefined)
    })
    it('should throw after 30s if not resolved', async () => {
      const { launcher } = setup()
      await expect(() =>
        launcher.setWorkerState({ url: 'https://cozy.io', timeout: 1 })
      ).rejects.toEqual(ERRORS.SET_WORKER_STATE_TOO_LONG_TO_INIT)
    })
  })
  describe('runServerJob', () => {
    it('should create job with proper parameters', async () => {
      const { launcher, client, create, waitFor } = setup()
      create.mockResolvedValueOnce({ data: { id: 'testjobid' } })
      waitFor.mockResolvedValueOnce({ data: { id: 'testjobid' } })
      const konnector = {
        slug: 'konnectorslug',
        clientSide: true
      }
      launcher.setStartContext({
        client,
        konnector,
        manifest: konnector,
        launcherClient: {
          setAppMetadata: () => null
        },
        account: fixtures.account,
        trigger: fixtures.trigger
      })
      const result = await launcher.runServerJob({ test: 'testvalue' })
      expect(create).toHaveBeenCalledTimes(1)
      expect(create).toHaveBeenCalledWith(
        'konnector',
        {
          test: 'testvalue',
          account: 'normal_account_id',
          folder_to_save: 'testfolderid',
          konnector: 'konnectorslug'
        },
        {},
        true
      )
      expect(result).toEqual({ data: { id: 'testjobid' } })
    })
  })
})
