import RNFS from 'react-native-fs'
import { Platform } from 'react-native'

import { getAssetVersion } from './copyAllFilesFromBundleAssets'

jest.mock('react-native-fs', () => ({
  readFileAssets: jest.fn(),
  readFile: jest.fn()
}))

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios'
  }
}))

describe('copyAllFilesFromBundleAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAssetVersion', () => {
    it(`should return manifest version on Android`, async () => {
      Platform.OS = 'android'
      RNFS.readFileAssets.mockResolvedValue(SAMPLE_MANIFEST)
      const result = await getAssetVersion()

      expect(RNFS.readFileAssets).toHaveBeenCalled()
      expect(result).toBe('1.46.0')
    })

    it(`should return manifest version on iOS`, async () => {
      Platform.OS = 'ios'
      RNFS.readFile.mockResolvedValue(SAMPLE_MANIFEST)
      const result = await getAssetVersion()

      expect(RNFS.readFile).toHaveBeenCalled()
      expect(result).toBe('1.46.0')
    })
  })
})

const SAMPLE_MANIFEST = `
{
  "name": "Home",
  "name_prefix": "Cozy",
  "slug": "home",
  "icon": "icon.svg",
  "categories": [
    "cozy",
    "konnectors"
  ],
  "type": "webapp",
  "source": "git://github.com/cozy/cozy-home.git",
  "editor": "Cozy",
  "developer": {
    "name": "Cozy Cloud",
    "url": "https://cozy.io"
  },
  "version": "1.46.0",
  "langs": [
    "de",
    "en",
    "es",
    "fr",
    "it",
    "ja",
    "nl_NL"
  ]
}
`
