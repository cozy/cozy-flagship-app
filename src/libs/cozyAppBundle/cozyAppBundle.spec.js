import Gzip from '@fengweichong/react-native-gzip'
import RNFS from 'react-native-fs'

import { createMockClient } from 'cozy-client/dist/mock'

import { fetchCozyAppVersion } from '../client'
import { updateCozyAppBundle } from './cozyAppBundle'

import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from './cozyAppBundleConfiguration'

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'SOME_DocumentDirectoryPath',
  downloadFile: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn()
}))

jest.mock('@fengweichong/react-native-gzip', () => ({
  unGzipTar: jest.fn()
}))

jest.mock('../client', () => ({
  fetchCozyAppVersion: jest.fn(),
  getFqdnFromClient: jest.requireActual('../client').getFqdnFromClient
}))

jest.mock('./cozyAppBundleConfiguration', () => ({
  getCurrentAppConfigurationForFqdnAndSlug: jest.fn(),
  setCurrentAppVersionForFqdnAndSlug: jest.fn()
}))

describe('cozyAppBundle', () => {
  const client = createMockClient({})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should download file from cozy-stack if new version is available for cozy-home', async () => {
    client.getStackClient = jest.fn(() => ({
      uri: 'http://cozy.10-0-2-2.nip.io',
      getAuthorizationHeader: jest
        .fn()
        .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
    }))

    mockLocalVersion('1.45.5')
    mockStackVersion('1.45.6')

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
    }))

    mockLocalVersion('1.45.5')
    mockStackVersion('1.45.6')

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
    }))

    mockLocalVersion('1.45.5')
    mockStackVersion('1.45.6')

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
    }))

    mockLocalVersion('1.45.5')
    mockStackVersion('1.45.5')

    mockBundleDoesNotExistInLocalFiles()
    mockSuccessBundleDownload()

    await updateCozyAppBundle({ slug: 'home', client })

    expect(fetchCozyAppVersion).toHaveBeenCalled()
    expect(RNFS.downloadFile).not.toHaveBeenCalled()
    expect(setCurrentAppVersionForFqdnAndSlug).not.toHaveBeenCalled()
  })

  it('should do switch local version if cozy-stack version is different but local package already exists', async () => {
    client.getStackClient = jest.fn(() => ({
      uri: 'http://cozy.10-0-2-2.nip.io',
      getAuthorizationHeader: jest
        .fn()
        .mockReturnValue('SOME_AUTHORIZATION_TOKEN')
    }))

    mockLocalVersion('1.45.5')
    mockStackVersion('1.45.6')

    mockBundleExistsInLocalFiles()
    mockSuccessBundleDownload()

    await updateCozyAppBundle({ slug: 'home', client })

    expect(fetchCozyAppVersion).toHaveBeenCalled()

    expect(RNFS.downloadFile).not.toHaveBeenCalled()

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
    }))

    mockLocalVersion('1.45.5')
    mockStackVersion('1.45.6')

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
    }))

    mockLocalVersion(undefined)
    mockStackVersion('1.45.6')

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
})

const mockBundleDoesNotExistInLocalFiles = () => {
  RNFS.exists.mockResolvedValue(false)
}

const mockBundleExistsInLocalFiles = () => {
  RNFS.exists.mockResolvedValue(true)
}

const mockSuccessBundleDownload = () => {
  RNFS.downloadFile.mockResolvedValue(true)
}

const mockStackVersion = version => {
  fetchCozyAppVersion.mockResolvedValue(version)
}

const mockLocalVersion = version => {
  getCurrentAppConfigurationForFqdnAndSlug.mockResolvedValue({ version })
}
