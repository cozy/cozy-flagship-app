jest.mock('react-native-fs', () => ({
  mkdir: jest.fn(),
  downloadFile: jest.fn(),
  unlink: jest.fn(),
  readDir: jest.fn(),
  moveFile: jest.fn(),
  readFile: jest.fn(),
  DocumentDirectoryPath: '/app',
}))
jest.mock('@fengweichong/react-native-gzip', () => ({
  unGzipTar: jest.fn(),
}))
import {
  extractGithubSourceUrl,
  ensureConnectorIsInstalled,
} from './ConnectorInstaller'
import RNFS from 'react-native-fs'
import Gzip from '@fengweichong/react-native-gzip'

describe('ConnectorInstaller', () => {
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
      const contentScript = await ensureConnectorIsInstalled({
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
      RNFS.readFile.mockResolvedValue('script content')
      expect(contentScript).toEqual('script content')
    })
  })
})
