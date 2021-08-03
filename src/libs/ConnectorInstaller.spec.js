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
jest.mock('@fengweichong/react-native-gzip', () => ({
  unGzipTar: jest.fn(),
}))
import {
  extractGithubSourceUrl,
  extractRegistrySourceUrl,
  ensureConnectorIsInstalled,
  getContentScriptContent,
} from './ConnectorInstaller'
import RNFS from 'react-native-fs'
import Gzip from '@fengweichong/react-native-gzip'

describe('ConnectorInstaller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('extractRegistrySourceUrl', () => {
    it('should extract registry source url from a registry stable source', async () => {
      fetch = jest.fn()
      fetch.mockResolvedValue({
        json: async () => ({
          url: 'https://apps-registry.cozycloud.cc/registry/template/1.0.0/tarball/xxx.tar.gz',
        }),
      })
      expect(
        await extractRegistrySourceUrl('registry://template/stable'),
      ).toEqual(
        'https://apps-registry.cozycloud.cc/registry/template/1.0.0/tarball/xxx.tar.gz',
      )
      expect(fetch).toHaveBeenCalledWith(
        'https://apps-registry.cozycloud.cc/registry/template/stable/latest',
      )
    })
    it('should throw when not a registry source', async () => {
      await expect(extractRegistrySourceUrl('wrong url')).rejects.toThrow(
        'extractRegistrySourceUrl: Could not install wrong url',
      )
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
    it('should work in nominal case', async () => {
      RNFS.downloadFile.mockResolvedValue({promise: new Promise.resolve()})
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
  })
  describe('getContentScriptContent', () => {
    it('should get content script content from local fs', async () => {
      await getContentScriptContent({slug: 'sncf'})
      expect(RNFS.readFile).toHaveBeenNthCalledWith(
        1,
        '/app/connectors/sncf/webviewScript.js',
      )
      RNFS.readFile.mockResolvedValue('local script content')
    })
  })
})
