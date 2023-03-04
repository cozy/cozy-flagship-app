import {
  getBaseFolderForFqdnAndSlug,
  getBaseRelativePathForFqdnAndSlug,
  getBaseRelativePathForFqdnAndSlugAndCurrentVersion,
  getServerBaseFolder
} from './httpPaths'
import { getCurrentAppConfigurationForFqdnAndSlug } from '../cozyAppBundle/cozyAppBundleConfiguration'

const MOCK_DIRECTORY_PATH = 'SOME_DocumentDirectoryPath'

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'SOME_DocumentDirectoryPath'
}))

jest.mock('../cozyAppBundle/cozyAppBundleConfiguration', () => ({
  getCurrentAppConfigurationForFqdnAndSlug: jest.fn()
}))

describe('httpPaths', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getServerBaseFolder', () => {
    it(`to return DocumentDirectoryPath from RNFS`, async () => {
      const result = getServerBaseFolder()

      expect(result).toBe(MOCK_DIRECTORY_PATH)
    })
  })

  describe('getBaseRelativePathForFqdnAndSlug', () => {
    it(`to return the relative path for specified fqdn and slug`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'
      const result = getBaseRelativePathForFqdnAndSlug(fqdn, slug)

      expect(result).toBe('/cozy.tools/home')
    })

    it(`should handle special characters in fqdn`, async () => {
      const fqdn = 'cozy.tools:8080'
      const slug = 'drive'
      const result = getBaseRelativePathForFqdnAndSlug(fqdn, slug)

      expect(result).toBe('/cozy.tools_8080/drive')
    })
  })

  describe('getBaseFolderForFqdnAndSlug', () => {
    it(`to return the base path for specified fqdn and slug`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'
      const result = await getBaseFolderForFqdnAndSlug(fqdn, slug)

      expect(result).toBe('SOME_DocumentDirectoryPath/cozy.tools/home')
    })

    it(`should handle special characters in fqdn`, async () => {
      const fqdn = 'cozy.tools:8080'
      const slug = 'drive'
      const result = await getBaseFolderForFqdnAndSlug(fqdn, slug)

      expect(result).toBe('SOME_DocumentDirectoryPath/cozy.tools_8080/drive')
    })
  })

  describe('getBaseRelativePathForFqdnAndSlugAndCurrentVersion', () => {
    it(`should return relative path for embedded assets when no config is set in local storage`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'

      getCurrentAppConfigurationForFqdnAndSlug.mockResolvedValue(undefined)

      const result = await getBaseRelativePathForFqdnAndSlugAndCurrentVersion(
        fqdn,
        slug
      )

      expect(result).toBe('/cozy.tools/home/embedded')
    })

    it(`should return relative path based on config from local storage`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'drive'

      getCurrentAppConfigurationForFqdnAndSlug.mockResolvedValue({
        folderName: 'SOME_APP_FOLDER'
      })

      const result = await getBaseRelativePathForFqdnAndSlugAndCurrentVersion(
        fqdn,
        slug
      )

      expect(result).toBe('/cozy.tools/drive/SOME_APP_FOLDER')
    })
  })
})
