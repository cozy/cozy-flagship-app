import { models } from 'cozy-client'
import { saveFiles } from 'cozy-clisk'

import Launcher from './Launcher'
import { saveCredential, getSlugAccountIds } from './keychain'

jest.mock('./keychain')
jest.mock('cozy-clisk')
jest.mock('cozy-client', () => ({
  ...jest.requireActual('cozy-client'),
  models: {
    konnectorFolder: {
      ensureKonnectorFolder: jest.fn()
    }
  }
}))

describe('Launcher', () => {
  describe('ensureAccountTriggerAndLaunch', () => {
    it('should not remove startContext attributes', async () => {
      const launcher = new Launcher()
      const account = {
        _id: 'testaccount'
      }
      const trigger = {
        _id: 'testtrigger',
        _rev: 'testtriggerrev',
        message: {
          account: 'testaccountid',
          konnector: 'testslug',
          folder_to_save: 'oldfolderid'
        }
      }
      models.konnectorFolder.ensureKonnectorFolder.mockResolvedValue({
        _id: 'createdfolderid'
      })
      const job = { _id: 'testjob' }
      const mockClient = {
        collection: () => mockClient,
        getInstanceOptions: jest.fn().mockReturnValueOnce({ locale: 'fr' }),
        save: jest.fn().mockResolvedValueOnce({
          data: { message: { folder_to_save: 'newfolderid' } }
        })
      }

      const konnector = {}
      const launcherClient = {
        setAppMetadata: () => null
      }
      launcher.ensureAccountName = jest.fn().mockResolvedValue(account)
      launcher.setStartContext({
        client: mockClient,
        konnector,
        account,
        trigger,
        job,
        manifest: { name: 'konnector' },
        launcherClient
      })

      await launcher.ensureAccountTriggerAndLaunch()
      expect(mockClient.save).toHaveBeenCalledWith({
        _id: 'testtrigger',
        _rev: 'testtriggerrev',
        _type: 'io.cozy.triggers',
        message: {
          account: 'testaccountid',
          konnector: 'testslug',
          folder_to_save: 'createdfolderid'
        }
      })
      expect(launcher.getStartContext()).toStrictEqual({
        account,
        trigger,
        job,
        client: mockClient,
        konnector,
        manifest: { name: 'konnector' },
        launcherClient
      })
    })
  })
  describe('saveCredentials', () => {
    it('should save credentials with proper attributes', async () => {
      const launcher = new Launcher()
      const konnector = { slug: 'testkonnectorslug' }
      const account = {
        _id: 'testaccountid'
      }
      const client = {
        getStackClient: () => ({
          uri: 'http://cozy.localhost:8080'
        })
      }
      launcher.setStartContext({
        konnector,
        client,
        account
      })
      await launcher.saveCredentials({
        login: 'testlogin',
        password: 'testpassword'
      })
      expect(saveCredential).toHaveBeenCalledWith(
        'cozy.localhost_8080',
        expect.objectContaining({
          _id: 'testaccountid',
          credentials: {
            login: 'testlogin',
            password: 'testpassword'
          },
          slug: 'testkonnectorslug',
          version: 1
        })
      )
    })
  })
  describe('cleanCredentialsAccounts', () => {
    it('should clean credentials accounts associated to non existing accounts', async () => {
      const launcher = new Launcher()
      const konnector = { slug: 'testkonnectorslug' }
      const client = {
        getStackClient: () => ({
          uri: 'http://cozy.localhost:8080'
        }),
        query: jest.fn().mockResolvedValueOnce({
          data: [{ _id: 'testaccountid1' }, { _id: 'testaccountid3' }]
        })
      }
      getSlugAccountIds.mockResolvedValueOnce([
        'testaccountid1',
        'testaccountid2',
        'testaccountid3'
      ])
      launcher.setStartContext({
        konnector,
        client
      })

      const result = await launcher.cleanCredentialsAccounts('testslug1')

      expect(result).toBe(true)
      expect(getSlugAccountIds).toHaveBeenCalledWith(
        'cozy.localhost_8080',
        'testslug1'
      )
      expect(client.query).toHaveBeenCalledWith(
        expect.objectContaining({
          ids: ['testaccountid1', 'testaccountid2', 'testaccountid3']
        })
      )
    })
    it('should return false if nothing was cleaned', async () => {
      const launcher = new Launcher()
      const konnector = { slug: 'testkonnectorslug' }
      const client = {
        query: jest.fn(),
        getStackClient: () => ({
          uri: 'http://cozy.localhost:8080'
        })
      }
      getSlugAccountIds.mockResolvedValueOnce([])
      launcher.setStartContext({
        konnector,
        client
      })

      const result = await launcher.cleanCredentialsAccounts('testslug1')

      expect(result).toBe(false)
      expect(getSlugAccountIds).toHaveBeenCalledWith(
        'cozy.localhost_8080',
        'testslug1'
      )
      expect(client.query).not.toHaveBeenCalled()
    })
  })
  describe('saveFiles', () => {
    it('should create an index of existing files and pass it to cozy-clisk saveFiles', async () => {
      const launcher = new Launcher()
      launcher.setUserData({
        sourceAccountIdentifier: 'testsourceaccountidentifier'
      })

      const konnector = { slug: 'testkonnectorslug' }
      const trigger = {
        message: {
          folder_to_save: 'testfolderid',
          account: 'testaccountid'
        }
      }
      const job = {
        message: { account: 'testaccountid', folder_to_save: 'testfolderid' }
      }
      const client = {
        queryAll: jest.fn().mockResolvedValue([
          {
            metadata: {
              fileIdAttributes: 'fileidattribute'
            }
          }
        ]),
        query: jest.fn().mockResolvedValue({ data: { path: 'folderPath' } })
      }
      launcher.setStartContext({
        konnector,
        client,
        launcherClient: client,
        trigger,
        job
      })

      await launcher.saveFiles([{}], {})

      expect(saveFiles).toHaveBeenCalledWith(
        client,
        [{}],
        'folderPath',
        expect.objectContaining({
          existingFilesIndex: new Map([
            [
              'fileidattribute',
              { metadata: { fileIdAttributes: 'fileidattribute' } }
            ]
          ]),
          sourceAccount: 'testaccountid',
          sourceAccountIdentifier: 'testsourceaccountidentifier'
        })
      )
    })
    it('should not reset files index on first call but should on second call to saveFiles', async () => {
      const launcher = new Launcher()
      jest
        .spyOn(launcher, 'getExistingFilesIndex')
        .mockImplementation(
          () =>
            new Map([
              [
                'fileidattribute',
                { metadata: { fileIdAttributes: 'fileidattribute' } }
              ]
            ])
        )
      launcher.setUserData({
        sourceAccountIdentifier: 'testsourceaccountidentifier'
      })

      const konnector = { slug: 'testkonnectorslug' }
      const trigger = {
        message: {
          folder_to_save: 'testfolderid',
          account: 'testaccountid'
        }
      }
      const job = {
        message: { account: 'testaccountid', folder_to_save: 'testfolderid' }
      }
      const client = {
        query: jest.fn().mockResolvedValue({ data: { path: 'folderPath' } })
      }
      launcher.setStartContext({
        konnector,
        client,
        launcherClient: client,
        trigger,
        job
      })

      await launcher.saveFiles([{}], {})
      expect(launcher.getExistingFilesIndex).toHaveBeenLastCalledWith(false)
      await launcher.saveFiles([{}], {})
      expect(launcher.getExistingFilesIndex).toHaveBeenLastCalledWith(true)
      await launcher.saveBills([{}], {})
      expect(launcher.getExistingFilesIndex).toHaveBeenLastCalledWith(true)
    })
    it('should ignore files without metadata or fileIdAttributes in the index', async () => {
      const launcher = new Launcher()
      launcher.setUserData({
        sourceAccountIdentifier: 'testsourceaccountidentifier'
      })

      const konnector = { slug: 'testkonnectorslug' }
      const trigger = {
        message: {
          folder_to_save: 'testfolderid',
          account: 'testaccountid'
        }
      }
      const job = {
        message: { account: 'testaccountid', folder_to_save: 'testfolderid' }
      }
      const client = {
        queryAll: jest.fn().mockResolvedValue([
          {
            _id: 'tokeep',
            metadata: {
              fileIdAttributes: 'fileidattribute'
            }
          },
          {
            _id: 'toignore'
          }
        ]),
        query: jest.fn().mockResolvedValue({ data: { path: 'folderPath' } })
      }
      launcher.setStartContext({
        konnector,
        client,
        launcherClient: client,
        trigger,
        job
      })

      await launcher.saveFiles([{}], {})

      expect(saveFiles).toHaveBeenCalledWith(client, [{}], 'folderPath', {
        downloadAndFormatFile: expect.any(Function),
        manifest: expect.any(Object),
        log: expect.any(Function),
        existingFilesIndex: new Map([
          [
            'fileidattribute',
            {
              _id: 'tokeep',
              metadata: { fileIdAttributes: 'fileidattribute' }
            }
          ]
        ]),
        sourceAccount: 'testaccountid',
        sourceAccountIdentifier: 'testsourceaccountidentifier'
      })
    })
    it('should retry on MAIN_FOLDER_REMOVED error', async () => {
      const launcher = new Launcher()
      launcher.setUserData({
        sourceAccountIdentifier: 'testsourceaccountidentifier'
      })

      const konnector = {
        slug: 'testkonnectorslug',
        id: 'testkonnectorid',
        _id: 'testkonnectorid',
        name: 'Test Konnector'
      }
      const trigger = {
        _type: 'io.cozy.triggers',
        message: {
          folder_to_save: 'testfolderid',
          account: 'testaccountid'
        }
      }
      const job = {
        message: { account: 'testaccountid', folder_to_save: 'testfolderid' }
      }
      const client = {
        getInstanceOptions: jest.fn().mockReturnValue({ locale: 'fr' }),
        queryAll: jest.fn().mockResolvedValue([
          {
            _id: 'tokeep',
            metadata: {
              fileIdAttributes: 'fileidattribute'
            }
          },
          {
            _id: 'toignore'
          }
        ]),
        query: jest
          .fn()
          .mockResolvedValue({ data: { path: 'folderPath' }, included: [] }),
        save: jest.fn().mockImplementation(() => ({ _id: 'triggerid' }))
      }
      launcher.setStartContext({
        konnector,
        account: { _id: 'testaccountid' },
        client,
        launcherClient: client,
        trigger,
        job
      })
      models.konnectorFolder.ensureKonnectorFolder.mockResolvedValue({
        _id: '/Administratif/Test Konnector/testaccountid'
      })
      saveFiles.mockRejectedValueOnce(new Error('MAIN_FOLDER_REMOVED'))

      await launcher.saveFiles([{}], {})

      expect(saveFiles).toHaveBeenNthCalledWith(1, client, [{}], 'folderPath', {
        downloadAndFormatFile: expect.any(Function),
        manifest: expect.any(Object),
        log: expect.any(Function),
        existingFilesIndex: new Map([
          [
            'fileidattribute',
            {
              _id: 'tokeep',
              metadata: { fileIdAttributes: 'fileidattribute' }
            }
          ]
        ]),
        sourceAccount: 'testaccountid',
        sourceAccountIdentifier: 'testsourceaccountidentifier'
      })
      expect(saveFiles).toHaveBeenNthCalledWith(2, client, [{}], 'folderPath', {
        downloadAndFormatFile: expect.any(Function),
        manifest: expect.any(Object),
        log: expect.any(Function),
        existingFilesIndex: new Map([
          [
            'fileidattribute',
            {
              _id: 'tokeep',
              metadata: { fileIdAttributes: 'fileidattribute' }
            }
          ]
        ]),
        sourceAccount: 'testaccountid',
        sourceAccountIdentifier: 'testsourceaccountidentifier'
      })

      expect(
        models.konnectorFolder.ensureKonnectorFolder
      ).toHaveBeenCalledTimes(1)
      expect(
        models.konnectorFolder.ensureKonnectorFolder
      ).toHaveBeenNthCalledWith(1, client, {
        konnector,
        account: { _id: 'testaccountid' },
        lang: 'fr'
      })
    })
  })
})
