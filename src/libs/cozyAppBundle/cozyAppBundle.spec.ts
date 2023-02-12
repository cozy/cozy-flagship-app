/* eslint-disable */
import Gzip from '@fengweichong/react-native-gzip'
import _RNFS from 'react-native-fs'

import { createMockClient } from 'cozy-client'

import {
  fetchCozyAppArchiveInfoForVersion,
  fetchCozyAppVersion
} from '/libs/client'
import {
  updateCozyAppBundle,
  updateCozyAppBundleInBackground
} from '/libs/cozyAppBundle/cozyAppBundle'

import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from '/libs/cozyAppBundle/cozyAppBundleConfiguration'

const RNFS = _RNFS as jest.Mocked<typeof _RNFS>

(RNFS.DocumentDirectoryPath as string) = 'SOME_DocumentDirectoryPath'

jest.mock('@fengweichong/react-native-gzip', () => ({
  unGzipTar: jest.fn()
}))

const mockLoggerError = jest.fn()
jest.mock('/libs/functions/logger', () => ({
  logger: () => {
    return {
      error: (param: string) => mockLoggerError(param),
      debug: jest.fn(),
      warn: jest.fn()
    }
  }
}))

jest.mock('../client', () => ({
  fetchCozyAppVersion: jest.fn(),
  fetchCozyAppArchiveInfoForVersion: jest.fn(),
  getFqdnFromClient: jest.requireActual('../client').getFqdnFromClient
}))

jest.mock('./cozyAppBundleConfiguration', () => ({
  getCurrentAppConfigurationForFqdnAndSlug: jest.fn(),
  setCurrentAppVersionForFqdnAndSlug: jest.fn()
}))

let originalSetTimeout: typeof setTimeout

describe('cozyAppBundle', () => {
  const client = createMockClient({queries: {}, remote: {}, clientOptions: {}})

  beforeEach(() => {
    originalSetTimeout = setTimeout

    jest.clearAllMocks()
  })

  afterEach(() => {
    global.setTimeout = originalSetTimeout
  })

  describe('updateCozyAppBundle', () => {
    it('should download file from cozy-stack if new version is available for cozy-home', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion('1.45.5')
      mockStackVersion('1.45.6')
      mockNoTarPrefix()

      mockBundleDoesNotExistInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'home', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'http://cozy.10-0-2-2.nip.io/apps/home/download/1.45.6',
        toFile:
          'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6.tar.gz',
        headers: {
          Authorization: 'SOME_AUTHORIZATION_TOKEN'
        }
      })

      expect(Gzip.unGzipTar).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6.tar.gz',
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6',
        true
      )

      expect(RNFS.unlink).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6.tar.gz'
      )

      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        fqdn: 'cozy.10-0-2-2.nip.io',
        slug: 'home',
        version: '1.45.6',
        folder: '1.45.6'
      })
    })

    it('should download file from cozy-stack if new version is available for any other slug', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.tools',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion('1.45.5')
      mockStackVersion('1.45.6')
      mockNoTarPrefix()

      mockBundleDoesNotExistInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'ANY_SLUG', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'http://cozy.tools/apps/ANY_SLUG/download/1.45.6',
        toFile: 'SOME_DocumentDirectoryPath/cozy.tools/ANY_SLUG/1.45.6.tar.gz',
        headers: {
          Authorization: 'SOME_AUTHORIZATION_TOKEN'
        }
      })

      expect(Gzip.unGzipTar).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.tools/ANY_SLUG/1.45.6.tar.gz',
        'SOME_DocumentDirectoryPath/cozy.tools/ANY_SLUG/1.45.6',
        true
      )

      expect(RNFS.unlink).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.tools/ANY_SLUG/1.45.6.tar.gz'
      )

      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        fqdn: 'cozy.tools',
        slug: 'ANY_SLUG',
        version: '1.45.6',
        folder: '1.45.6'
      })
    })

    it('should download file from cozy-stack if new version is available for any other FQDN', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://any_fqdn',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion('1.45.5')
      mockStackVersion('1.45.6')
      mockNoTarPrefix()

      mockBundleDoesNotExistInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'home', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'http://any_fqdn/apps/home/download/1.45.6',
        toFile: 'SOME_DocumentDirectoryPath/any_fqdn/home/1.45.6.tar.gz',
        headers: {
          Authorization: 'SOME_AUTHORIZATION_TOKEN'
        }
      })

      expect(Gzip.unGzipTar).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/any_fqdn/home/1.45.6.tar.gz',
        'SOME_DocumentDirectoryPath/any_fqdn/home/1.45.6',
        true
      )

      expect(RNFS.unlink).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/any_fqdn/home/1.45.6.tar.gz'
      )

      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        fqdn: 'any_fqdn',
        slug: 'home',
        version: '1.45.6',
        folder: '1.45.6'
      })
    })

    it('should do nothing if cozy-stack version is identical to local version', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion('1.45.5')
      mockStackVersion('1.45.5')
      mockNoTarPrefix()

      mockBundleDoesNotExistInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'home', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()
      expect(RNFS.downloadFile).not.toHaveBeenCalled()
      expect(setCurrentAppVersionForFqdnAndSlug).not.toHaveBeenCalled()
    })

    it('should remove local version before download if cozy-stack version is different but local package already exists', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion('1.45.5')
      mockStackVersion('1.45.6')
      mockNoTarPrefix()

      mockBundleExistsInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'home', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(RNFS.unlink).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6'
      )
      expect(RNFS.downloadFile).toHaveBeenCalled()

      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        fqdn: 'cozy.10-0-2-2.nip.io',
        slug: 'home',
        version: '1.45.6',
        folder: '1.45.6'
      })
    })

    it('should handle special characters in cozy url', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io:8080',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion('1.45.5')
      mockStackVersion('1.45.6')
      mockNoTarPrefix()

      mockBundleDoesNotExistInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'home', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'http://cozy.10-0-2-2.nip.io:8080/apps/home/download/1.45.6',
        toFile:
          'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io_8080/home/1.45.6.tar.gz',
        headers: {
          Authorization: 'SOME_AUTHORIZATION_TOKEN'
        }
      })

      expect(Gzip.unGzipTar).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io_8080/home/1.45.6.tar.gz',
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io_8080/home/1.45.6',
        true
      )

      expect(RNFS.unlink).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io_8080/home/1.45.6.tar.gz'
      )

      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        fqdn: 'cozy.10-0-2-2.nip.io:8080',
        slug: 'home',
        version: '1.45.6',
        folder: '1.45.6'
      })
    })

    it('should download file from cozy-stack no version is set locally', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion(undefined)
      mockStackVersion('1.45.6')
      mockNoTarPrefix()

      mockBundleDoesNotExistInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'home', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'http://cozy.10-0-2-2.nip.io/apps/home/download/1.45.6',
        toFile:
          'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6.tar.gz',
        headers: {
          Authorization: 'SOME_AUTHORIZATION_TOKEN'
        }
      })

      expect(Gzip.unGzipTar).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6.tar.gz',
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6',
        true
      )

      expect(RNFS.unlink).toHaveBeenCalledWith(
        'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6.tar.gz'
      )

      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        fqdn: 'cozy.10-0-2-2.nip.io',
        slug: 'home',
        version: '1.45.6',
        folder: '1.45.6'
      })
    })

    it('should handle TarPrefix', async () => {
      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion('1.45.5')
      mockStackVersion('1.45.6')
      mockTarPrefix('/SOME_TAR_PREFIX')

      mockBundleDoesNotExistInLocalFiles()
      mockSuccessBundleDownload()

      await updateCozyAppBundle({ slug: 'home', client })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        fqdn: 'cozy.10-0-2-2.nip.io',
        slug: 'home',
        version: '1.45.6',
        folder: '1.45.6/SOME_TAR_PREFIX'
      })
    })
  })

  describe('updateCozyAppBundleInBackground', () => {
    it('should silently fail on download failure and log error', async () => {
      global.setTimeout = ((
        callback: Parameters<typeof setTimeout>[0]
      ): ReturnType<typeof setTimeout> =>
        callback() as unknown as NodeJS.Timeout) as unknown as typeof setTimeout

      client.getStackClient = jest.fn(() => ({
        uri: 'http://cozy.10-0-2-2.nip.io',
        getAuthorizationHeader: jest
          .fn()
          .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
      })) as unknown as jest.MockedFunction<typeof client.getStackClient>

      mockLocalVersion(undefined)
      mockStackVersion('1.45.6')
      mockNoTarPrefix()

      mockBundleDoesNotExistInLocalFiles()
      mockFailedBundleDownload()

      await updateCozyAppBundleInBackground({
        slug: 'home',
        client,
        delayInMs: 0
      })

      expect(fetchCozyAppVersion).toHaveBeenCalled()

      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl: 'http://cozy.10-0-2-2.nip.io/apps/home/download/1.45.6',
        toFile:
          'SOME_DocumentDirectoryPath/cozy.10-0-2-2.nip.io/home/1.45.6.tar.gz',
        headers: {
          Authorization: 'SOME_AUTHORIZATION_TOKEN'
        }
      })

      expect(Gzip.unGzipTar).not.toHaveBeenCalled()

      expect(RNFS.unlink).not.toHaveBeenCalled()

      expect(setCurrentAppVersionForFqdnAndSlug).not.toHaveBeenCalled()

      expect(mockLoggerError.mock.calls).toEqual([
        ['Error while downloading archive: Status code: 404'],
        ['Something went wront while updating home bundle: Status code: 404']
      ])
    })
  })
})

const mockBundleDoesNotExistInLocalFiles = () => {
  RNFS.exists.mockResolvedValue(false)
}

const mockBundleExistsInLocalFiles = () => {
  RNFS.exists.mockResolvedValue(true)
}

const mockSuccessBundleDownload = () => {
  RNFS.downloadFile.mockReturnValue({
    promise: Promise.resolve({ statusCode: 200, jobId: 1, bytesWritten: 1}),
    jobId: 1
  })
}

const mockFailedBundleDownload = () => {
  RNFS.downloadFile.mockReturnValue({
    promise: Promise.resolve({ statusCode: 404, jobId: 1, bytesWritten: 1}),
    jobId: 1
  })
}

const mockStackVersion = (version: string) => {
  const mockedFetchCozyAppVersion = fetchCozyAppVersion as jest.Mock
  mockedFetchCozyAppVersion.mockResolvedValue(version)
}

const mockLocalVersion = (version?: string) => {
  const mockedGetCurrentAppConfigurationForFqdnAndSlug = getCurrentAppConfigurationForFqdnAndSlug as jest.Mock
  mockedGetCurrentAppConfigurationForFqdnAndSlug.mockResolvedValue({ version })
}

const mockNoTarPrefix = () => {
  const mockedFetchCozyAppArchiveInfoForVersion = fetchCozyAppArchiveInfoForVersion as jest.Mock
  mockedFetchCozyAppArchiveInfoForVersion.mockResolvedValue({ tarPrefix: '' })
}

const mockTarPrefix = (prefix: string) => {
  const mockedFetchCozyAppArchiveInfoForVersion = fetchCozyAppArchiveInfoForVersion as jest.Mock
  mockedFetchCozyAppArchiveInfoForVersion.mockResolvedValue({
    tarPrefix: prefix
  })
}
