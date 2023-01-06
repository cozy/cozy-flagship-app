import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from './cozyAppBundleConfiguration'

import strings from '/constants/strings.json'

describe('cozyAppBundleConfiguration', () => {
  beforeEach(() => {
    AsyncStorage.clear()
    jest.clearAllMocks()
  })

  describe('getCurrentAppConfigurationForFqdnAndSlug', () => {
    it('should return configuration for specified CozyApp if exists (home)', async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'

      AsyncStorage.getItem.mockResolvedValue(MOCK_LOCAl_STORAGE)

      const result = await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)

      expect(result).toStrictEqual({ version: '1.2.3', folderName: 'f1.2.3' })
    })

    it('should return configuration for specified CozyApp if exists (drive)', async () => {
      const fqdn = 'cozy.tools'
      const slug = 'drive'

      AsyncStorage.getItem.mockResolvedValue(MOCK_LOCAl_STORAGE)

      const result = await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)

      expect(result).toStrictEqual({ version: '4.5.6', folderName: 'f4.5.6' })
    })

    it('should return undefined configuration if specified CozyApp does not exists for FQDN', async () => {
      const fqdn = 'cozy.tools'
      const slug = 'NOT_EXISTING_SLUG'

      AsyncStorage.getItem.mockResolvedValue(MOCK_LOCAl_STORAGE)

      const result = await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)

      expect(result).toStrictEqual(undefined)
    })

    it('should return undefined configuration if specified FQDN does not exists', async () => {
      const fqdn = 'NOT_EXISTING_FQDN'
      const slug = 'home'

      AsyncStorage.getItem.mockResolvedValue(MOCK_LOCAl_STORAGE)

      const result = await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)

      expect(result).toStrictEqual(undefined)
    })

    it('should return undefined configuration if nothing exists in local storage', async () => {
      const fqdn = 'NOT_EXISTING_FQDN'
      const slug = 'home'

      AsyncStorage.getItem.mockResolvedValue(undefined)

      const result = await getCurrentAppConfigurationForFqdnAndSlug(fqdn, slug)

      expect(result).toStrictEqual(undefined)
    })
  })

  describe('setCurrentAppVersionForFqdnAndSlug', () => {
    it('should set specified version on CozyApp for FQDN and slug', async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'
      const version = '7.8.9'
      const folder = 'f7.8.9'

      AsyncStorage.getItem.mockResolvedValue(MOCK_LOCAl_STORAGE)

      await setCurrentAppVersionForFqdnAndSlug({ fqdn, slug, version, folder })

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        strings.BUNDLE_STORAGE_KEY,
        JSON.stringify({
          'cozy.tools': {
            home: {
              version: '7.8.9',
              folderName: 'f7.8.9'
            },
            drive: {
              version: '4.5.6',
              folderName: 'f4.5.6'
            }
          },
          'cozy.localhost': {
            home: {
              version: '1.2.3',
              folderName: 'f1.2.3'
            },
            drive: {
              version: '4.5.6',
              folderName: 'f4.5.6'
            }
          }
        })
      )
    })

    it('should handle unexisting config when setting specified version on CozyApp for FQDN and slug', async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'
      const version = '7.8.9'
      const folder = 'f7.8.9'

      AsyncStorage.getItem.mockResolvedValue(undefined)

      await setCurrentAppVersionForFqdnAndSlug({ fqdn, slug, version, folder })

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        strings.BUNDLE_STORAGE_KEY,
        JSON.stringify({
          'cozy.tools': {
            home: {
              version: '7.8.9',
              folderName: 'f7.8.9'
            }
          }
        })
      )
    })
  })
})

const MOCK_LOCAl_STORAGE = JSON.stringify({
  'cozy.tools': {
    home: {
      version: '1.2.3',
      folderName: 'f1.2.3'
    },
    drive: {
      version: '4.5.6',
      folderName: 'f4.5.6'
    }
  },
  'cozy.localhost': {
    home: {
      version: '1.2.3',
      folderName: 'f1.2.3'
    },
    drive: {
      version: '4.5.6',
      folderName: 'f4.5.6'
    }
  }
})
