import { saveFiles } from 'cozy-clisk'

import Launcher from './Launcher'
import { saveCredential, getSlugAccountIds } from './keychain'

jest.mock('./keychain')
jest.mock('cozy-clisk')

const existingMagicFolder = [
  {
    path: '/Administratif',
    created_at: '2023-03-02T14:57:07.661588+01:00'
  }
]

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
      const job = { _id: 'testjob' }
      const mockClient = {
        collection: () => mockClient,
        findReferencedBy: jest
          .fn()
          .mockResolvedValue({ included: existingMagicFolder }),
        statByPath: jest.fn().mockRejectedValueOnce({ status: 404 }),
        add: jest.fn(),
        addReferencesTo: jest.fn(),
        createDirectoryByPath: jest.fn().mockResolvedValueOnce({
          data: {
            _id: 'createdfolderid'
          }
        }),
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
    it('should not throw if a downloadFileInWorker throws but log a warning message', async () => {
      const launcher = new Launcher()
      launcher.log = jest.fn()
      launcher.worker = {
        call: jest
          .fn()
          .mockRejectedValue(new Error('downloadFileInWorker error message'))
      }
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

      saveFiles.mockImplementation((client, entries, folderPath, options) => {
        options.downloadAndFormatFile(entries[0])
      })

      await launcher.saveFiles(
        [
          {
            fileurl: 'test file url'
          }
        ],
        {}
      )

      expect(saveFiles).toHaveBeenCalledWith(
        client,
        [{ fileurl: 'test file url' }],
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
      expect(launcher.log).toHaveBeenCalledWith({
        level: 'warning',
        message:
          'Could not download entry: test file url: downloadFileInWorker error message',
        namespace: 'Launcher',
        label: 'downloadAndFormatFile'
      })
    })
    it('should create an index of existing files and pass it to cozy-clisk saveFiles', async () => {
      const launcher = new Launcher()
      launcher.log = jest.fn()
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
  })
})
