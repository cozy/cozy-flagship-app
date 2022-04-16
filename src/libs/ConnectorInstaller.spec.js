jest.mock('react-native-fs', () => ({
  mkdir: jest.fn(),
  downloadFile: jest.fn(),
  unlink: jest.fn(),
  readDir: jest.fn(),
  moveFile: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  DocumentDirectoryPath: '/app',
}))
jest.mock('@fengweichong/react-native-gzip', () => ({unGzipTar: jest.fn()}))
import {
  extractGithubSourceUrl,
  extractRegistrySourceUrl,
  ensureConnectorIsInstalled,
  getContentScript,
  getManifest,
} from './ConnectorInstaller'
import RNFS from 'react-native-fs'
import Gzip from '@fengweichong/react-native-gzip'

describe('ConnectorInstaller', () => {
  const client = {
    stackClient: {
      fetchJSON: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('extractRegistrySourceUrl', () => {
    it('should extract registry source url from a registry stable source', async () => {
      client.stackClient.fetchJSON.mockResolvedValue({
        url: 'https://apps-registry.cozycloud.cc/registry/template/1.0.0/tarball/xxx.tar.gz',
      })
      expect(
        await extractRegistrySourceUrl({
          source: 'registry://template/stable',
          client,
        }),
      ).toEqual(
        'https://apps-registry.cozycloud.cc/registry/template/1.0.0/tarball/xxx.tar.gz',
      )
      expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/registry/template/stable/latest',
      )
    })
    it('should extract registry source url from any possible registry source ', async () => {
      client.stackClient.fetchJSON.mockResolvedValue({})
      // eslint-disable-next-line no-global-assign
      fetch = jest.fn()
      const registryTestSuite = [
        ['registry://template', '/registry/template/stable/latest'],
        ['registry://template/beta', '/registry/template/beta/latest'],
        ['registry://template/dev/latest', '/registry/template/dev/latest'],
        ['registry://template/stable/1.0.1', '/registry/template/1.0.1'],
        ['registry://template/1.0.2', '/registry/template/1.0.2'],
      ]

      for (const [i, [source, url]] of registryTestSuite.entries()) {
        await extractRegistrySourceUrl({source, client})
        expect(client.stackClient.fetchJSON).toHaveBeenNthCalledWith(
          i + 1,
          'GET',
          url,
        )
      }
    })
    it('should throw when not a registry source', async () => {
      await expect(
        extractRegistrySourceUrl({source: 'wrong url', client}),
      ).rejects.toThrow('extractRegistrySourceUrl: Could not install wrong url')
    })
  })
  describe('extractGithubSourceUrl', () => {
    it('should extract github source url from a source without branch to master branch', () => {
      expect(
        extractGithubSourceUrl(
          'git://github.com/konnectors/cozy-konnector-template.git',
        ),
      ).toEqual(
        'https://github.com/konnectors/cozy-konnector-template/archive/refs/heads/master.tar.gz',
      )
    })
    it('should extract github source url from a source with branch', () => {
      expect(
        extractGithubSourceUrl(
          'git://github.com/konnectors/cozy-konnector-template.git#test',
        ),
      ).toEqual(
        'https://github.com/konnectors/cozy-konnector-template/archive/refs/heads/test.tar.gz',
      )
    })
    it('should throw when not a github source', () => {
      expect(() =>
        extractGithubSourceUrl('registry://template/stable'),
      ).toThrow(
        'extractGithubUrl: Could not install registry://template/stable',
      )
    })
  })
  describe('ensureConnectorIsInstalled', () => {
    it('should download and extract connector archive from github with github source', async () => {
      RNFS.downloadFile.mockResolvedValue({
        promise: Promise.resolve({statusCode: 200}),
      })
      RNFS.readDir.mockResolvedValue([
        {
          name: 'template',
          path: '/app/connectors/template/unzip',
          isDirectory: () => true,
        },
      ])
      RNFS.readFile.mockResolvedValue('script content')
      await ensureConnectorIsInstalled({
        slug: 'template',
        source: 'git://github.com/konnectors/cozy-konnector-template.git',
      })
      expect(RNFS.mkdir).toHaveBeenCalledWith('/app/connectors/template')
      expect(RNFS.downloadFile).toHaveBeenCalledWith({
        fromUrl:
          'https://github.com/konnectors/cozy-konnector-template/archive/refs/heads/master.tar.gz',
        toFile: '/app/connectors/template/master.tar.gz',
      })
      expect(Gzip.unGzipTar).toHaveBeenCalledWith(
        '/app/connectors/template/master.tar.gz',
        '/app/connectors/template/unzip',
        true,
      )
      expect(RNFS.unlink).toHaveBeenNthCalledWith(
        1,
        '/app/connectors/template/master.tar.gz',
      )
      expect(RNFS.moveFile).toHaveBeenNthCalledWith(
        1,
        '/app/connectors/template/unzip/manifest.konnector',
        '/app/connectors/template/manifest.konnector',
      )
      expect(RNFS.moveFile).toHaveBeenNthCalledWith(
        2,
        '/app/connectors/template/unzip/webviewScript.js',
        '/app/connectors/template/webviewScript.js',
      )
      expect(RNFS.unlink).toHaveBeenNthCalledWith(
        2,
        '/app/connectors/template/unzip',
      )
    })
    it('should not install a new version if the expected version is already installed', async () => {
      RNFS.readFile
        .mockResolvedValueOnce('1.0.0')
        .mockResolvedValueOnce('script content 1.0.0')
      await ensureConnectorIsInstalled({
        slug: 'template',
        source: 'git://github.com/konnectors/cozy-konnector-template.git',
        version: '1.0.0',
      })
      expect(RNFS.mkdir).toHaveBeenCalledWith('/app/connectors/template')
      expect(RNFS.downloadFile).not.toHaveBeenCalled()
      expect(Gzip.unGzipTar).not.toHaveBeenCalled()
      expect(RNFS.unlink).not.toHaveBeenCalled()
      expect(RNFS.moveFile).not.toHaveBeenCalled()
    })
    it('should raise an error when there is a network error', async () => {
      RNFS.downloadFile.mockResolvedValue({
        promise: Promise.resolve({statusCode: 404}),
      })
      await expect(
        ensureConnectorIsInstalled({
          slug: 'template',
          source: 'git://github.com/konnectors/cozy-konnector-template.git',
        }),
      ).rejects.toThrow('CLIENT_CONNECTOR_INSTALL_ERROR')
    })
    it('should raise an error when there is a file system error', async () => {
      RNFS.downloadFile.mockRejectedValue(new Error('ENOENT'))
      await expect(
        ensureConnectorIsInstalled({
          slug: 'template',
          source: 'git://github.com/konnectors/cozy-konnector-template.git',
        }),
      ).rejects.toThrow('CLIENT_CONNECTOR_INSTALL_ERROR')
    })
  })
  describe('getContentScript', () => {
    it('should get content script content from local fs', async () => {
      RNFS.readFile.mockResolvedValueOnce('local script content')
      const content = await getContentScript({slug: 'sncf'})
      expect(RNFS.readFile).toHaveBeenNthCalledWith(
        1,
        '/app/connectors/sncf/webviewScript.js',
      )
      expect(content).toEqual('local script content')
    })
  })
  describe('getManifest', () => {
    it('should get the connector manifest from the local fs', async () => {
      RNFS.readFile.mockResolvedValue('{"slug": "sncf"}')
      const manifest = await getManifest({slug: 'sncf'})
      expect(RNFS.readFile).toHaveBeenNthCalledWith(
        1,
        '/app/connectors/sncf/manifest.konnector',
      )
      expect(manifest).toEqual({slug: 'sncf'})
    })
  })
})
