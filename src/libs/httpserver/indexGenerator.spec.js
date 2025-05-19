import RN from 'react-native'
import RNFS from 'react-native-fs'

import { getAssetVersion, prepareAssets } from './copyAllFilesFromBundleAssets'
import {
  getBaseFolderForFqdnAndSlug,
  getBaseFolderForFqdnAndSlugAndCurrentVersion
} from './httpPaths'
import { fillIndexWithData, getIndexForFqdnAndSlug } from './indexGenerator'
import {
  getCurrentAppConfigurationForFqdnAndSlug,
  setCurrentAppVersionForFqdnAndSlug
} from '../cozyAppBundle/cozyAppBundleConfiguration'

import { shouldDisableGetIndex } from '/core/tools/env'

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios'
  },
  AppState: {
    addEventListener: jest.fn()
  }
}))

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'SOME_DocumentDirectoryPath',
  exists: jest.fn(),
  mkdir: jest.fn(),
  readFile: jest.fn()
}))

jest.mock('./copyAllFilesFromBundleAssets', () => ({
  prepareAssets: jest.fn(),
  getAssetVersion: jest.fn()
}))

jest.mock('../cozyAppBundle/cozyAppBundleConfiguration', () => ({
  getCurrentAppConfigurationForFqdnAndSlug: jest.fn(),
  setCurrentAppVersionForFqdnAndSlug: jest.fn()
}))

jest.mock('./httpPaths', () => ({
  getBaseFolderForFqdnAndSlug: jest.fn(),
  getBaseFolderForFqdnAndSlugAndCurrentVersion: jest.fn(),
  getBaseRelativePathForFqdnAndSlugAndCurrentVersion:
    jest.requireActual('./httpPaths')
      .getBaseRelativePathForFqdnAndSlugAndCurrentVersion
}))

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(),
  show: jest.fn()
}))

const client = {
  getStackClient: () => ({
    uri: 'https://claude.mycozy.cloud'
  })
}

const ifTestEnabled = shouldDisableGetIndex() ? describe.skip : describe

ifTestEnabled('indexGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getCurrentAppConfigurationForFqdnAndSlug.mockResolvedValue({})
  })

  describe('fillIndexWithData', () => {
    it(`to correctly fill cozy-home's index.html`, async () => {
      const result = await fillIndexWithData({
        fqdn: 'claude.mycozy.cloud',
        slug: 'home',
        port: 5757,
        securityKey: 'SOME_SECURITY_KEY',
        indexContent: rawContent,
        indexData: fakeData,
        client
      })

      expect(result).toBe(expectedContent)
    })

    describe(`with 'href' paths`, () => {
      it('should replace relative href to absolute localhost href', async () => {
        const content =
          '<link rel="stylesheet" href="vendors-home.4740287bb69e5ea49e26.0.min.css" />'

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result).toBe(
          '<link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors-home.4740287bb69e5ea49e26.0.min.css" />'
        )
      })

      it('should replace multiple relative hrefs to absolute localhost hrefs', async () => {
        const content = `<link rel="stylesheet" href="vendors-home.4740287bb69e5ea49e26.0.min.css" />
        <link rel="stylesheet" href="app-home.53f72c970a7c14ef3a0c.min.css" />`

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result)
          .toBe(`<link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors-home.4740287bb69e5ea49e26.0.min.css" />
        <link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/app-home.53f72c970a7c14ef3a0c.min.css" />`)
      })

      it('should replace base href to absolute localhost href', async () => {
        const content =
          '<link rel="stylesheet" href="/vendors-home.4740287bb69e5ea49e26.0.min.css" />'

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result).toBe(
          '<link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors-home.4740287bb69e5ea49e26.0.min.css" />'
        )
      })

      it('should replace multiple base hrefs to absolute localhost hrefs', async () => {
        const content = `<link rel="stylesheet" href="/vendors-home.4740287bb69e5ea49e26.0.min.css" />
        <link rel="stylesheet" href="/app-home.53f72c970a7c14ef3a0c.min.css" />`

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result)
          .toBe(`<link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors-home.4740287bb69e5ea49e26.0.min.css" />
        <link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/app-home.53f72c970a7c14ef3a0c.min.css" />`)
      })

      it(`to replace 'href="//{.Domain}' with absolute cozy link`, async () => {
        const content =
          '<link rel="stylesheet" href="//{{.Domain}}/vendors-home.4740287bb69e5ea49e26.0.min.css" />'

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result).toBe(
          '<link rel="stylesheet" href="https://claude.mycozy.cloud/vendors-home.4740287bb69e5ea49e26.0.min.css" />'
        )
      })
    })

    describe(`with 'src' paths`, () => {
      it('should replace relative src to absolute localhost src', async () => {
        const content =
          '<script src="vendors/home.000f5f10d9fca3ceac41.js"></script>'

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result).toBe(
          '<script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors/home.000f5f10d9fca3ceac41.js"></script>'
        )
      })

      it('should replace multiple relative srcs to absolute localhost srcs', async () => {
        const content = `<script src="vendors/home.000f5f10d9fca3ceac41.js"></script>
        <script src="app/home.f6f22f0d747344045d69.js"></script>`

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result)
          .toBe(`<script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors/home.000f5f10d9fca3ceac41.js"></script>
        <script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/app/home.f6f22f0d747344045d69.js"></script>`)
      })

      it('should replace base src to absolute localhost src', async () => {
        const content =
          '<script src="/vendors/home.000f5f10d9fca3ceac41.js"></script>'

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result).toBe(
          '<script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors/home.000f5f10d9fca3ceac41.js"></script>'
        )
      })

      it('should replace multiple base srcs to absolute localhost srcs', async () => {
        const content = `<script src="/vendors/home.000f5f10d9fca3ceac41.js"></script>
        <script src="/app/home.f6f22f0d747344045d69.js"></script>`

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result)
          .toBe(`<script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors/home.000f5f10d9fca3ceac41.js"></script>
        <script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/app/home.f6f22f0d747344045d69.js"></script>`)
      })

      it(`to replace 'src="//{.Domain}' with absolute cozy link`, async () => {
        const content =
          '<script src="//{{.Domain}}/vendors/home.000f5f10d9fca3ceac41.js"></script>'

        const result = await fillIndexWithData({
          fqdn: 'claude.mycozy.cloud',
          slug: 'home',
          port: 5757,
          securityKey: 'SOME_SECURITY_KEY',
          indexContent: content,
          indexData: fakeData,
          client
        })

        expect(result).toBe(
          '<script src="https://claude.mycozy.cloud/vendors/home.000f5f10d9fca3ceac41.js"></script>'
        )
      })
    })
  })

  describe('getIndexForFqdnAndSlug', () => {
    beforeEach(() => {
      getBaseFolderForFqdnAndSlug.mockReturnValue('SOME_BASE_PATH')
      getBaseFolderForFqdnAndSlugAndCurrentVersion.mockResolvedValue(
        'SOME_BASE_PATH_CURRENT_VERSION'
      )
      RNFS.readFile.mockResolvedValue('SOME_FILE_CONTENT')
      getAssetVersion.mockResolvedValue('1.2.3')
    })

    it(`should return content from local index.html`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'

      RNFS.exists.mockResolvedValue(false)

      const result = await getIndexForFqdnAndSlug(fqdn, slug)

      expect(RNFS.readFile).toHaveBeenCalledWith(
        'SOME_BASE_PATH_CURRENT_VERSION/index.html'
      )
      expect(result).toBe('SOME_FILE_CONTENT')
    })

    it(`should init local bundle if not existing`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'

      RNFS.exists.mockResolvedValue(false)

      const result = await getIndexForFqdnAndSlug(fqdn, slug)

      expect(result).toBe('SOME_FILE_CONTENT')
      expect(prepareAssets).toHaveBeenCalledWith('SOME_BASE_PATH/embedded')
      expect(RNFS.exists).toHaveBeenCalledWith(
        'SOME_BASE_PATH/embedded/manifest.webapp'
      )
      expect(setCurrentAppVersionForFqdnAndSlug).toHaveBeenCalledWith({
        folder: 'embedded',
        fqdn: 'cozy.tools',
        slug: 'home',
        version: '1.2.3'
      })
    })

    it(`should not init local bundle if it exists`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'home'

      RNFS.exists.mockResolvedValue(true)

      const result = await getIndexForFqdnAndSlug(fqdn, slug)

      expect(result).toBe('SOME_FILE_CONTENT')
      expect(prepareAssets).not.toHaveBeenCalled()
      expect(setCurrentAppVersionForFqdnAndSlug).not.toHaveBeenCalled()
    })

    it(`should not try to generate index.html if no config is set`, async () => {
      const fqdn = 'cozy.tools'
      const slug = 'drive'

      getCurrentAppConfigurationForFqdnAndSlug.mockResolvedValue(undefined)

      const result = await getIndexForFqdnAndSlug(fqdn, slug)

      expect(result).toBe(false)
    })

    describe(`TEMPORARY hack until we fil 'window.history' in iOS`, () => {
      it(`should not try to generate index.html if slug is 'mespapiers' and platform is 'iOS'`, async () => {
        const fqdn = 'cozy.tools'
        const slug = 'mespapiers'
        RN.Platform.OS = 'ios'

        const result = await getIndexForFqdnAndSlug(fqdn, slug)

        expect(result).toBe(false)
      })

      it(`should generate index.html if slug is 'mespapiers' and platform is 'android'`, async () => {
        const fqdn = 'cozy.tools'
        const slug = 'mespapiers'
        RN.Platform.OS = 'android'

        const result = await getIndexForFqdnAndSlug(fqdn, slug)

        expect(result).toBe('SOME_FILE_CONTENT')
      })

      it(`should not try to generate index.html if slug is 'settings' and platform is 'iOS'`, async () => {
        const fqdn = 'cozy.tools'
        const slug = 'settings'
        RN.Platform.OS = 'ios'

        const result = await getIndexForFqdnAndSlug(fqdn, slug)

        expect(result).toBe(false)
      })

      it(`should generate index.html if slug is 'settings' and platform is 'android'`, async () => {
        const fqdn = 'cozy.tools'
        const slug = 'settings'
        RN.Platform.OS = 'android'

        const result = await getIndexForFqdnAndSlug(fqdn, slug)

        expect(result).toBe('SOME_FILE_CONTENT')
      })

      it(`should not try to generate index.html if slug is 'drive' and platform is 'iOS'`, async () => {
        const fqdn = 'cozy.tools'
        const slug = 'drive'
        RN.Platform.OS = 'ios'

        const result = await getIndexForFqdnAndSlug(fqdn, slug)

        expect(result).toBe(false)
      })

      it(`should generate index.html if slug is 'drive' and platform is 'android'`, async () => {
        const fqdn = 'cozy.tools'
        const slug = 'drive'
        RN.Platform.OS = 'android'

        const result = await getIndexForFqdnAndSlug(fqdn, slug)

        expect(result).toBe('SOME_FILE_CONTENT')
      })
    })
  })
})

const rawContent = `<!DOCTYPE html>
<html lang="{{.Locale}}">
  <head>
    <meta charset="utf-8" />
    <title>Cozy Home</title>
    {{.Favicon}}
    <link rel="manifest" href="/manifest.json" crossorigin="use-credentials" />
    <meta name="msapplication-TileColor" content="#2b5797" />
    <meta name="theme-color" content="#ffffff" />
    <meta
      name="viewport"
      content="width=device-width,height=device-height,initial-scale=1,viewport-fit=cover"
    />
    <link rel="stylesheet" href="vendors-home.4740287bb69e5ea49e26.0.min.css" />
    <link rel="stylesheet" href="app-home.53f72c970a7c14ef3a0c.min.css" />
    <link rel="stylesheet" href="//{{.Domain}}/assets/fonts/fonts.css" />
    {{.ThemeCSS}} {{.CozyClientJS}}
  </head>
  <body>
    <div
      role="application"
      data-cozy="{{.CozyData}}"
      data-cozy-token="{{.Token}}"
      data-cozy-domain="{{.Domain}}"
      data-cozy-locale="{{.Locale}}"
      data-cozy-app-editor="{{.AppEditor}}"
      data-cozy-app-name="{{.AppName}}"
      data-cozy-app-name-prefix="{{.AppNamePrefix}}"
      data-cozy-app-slug="{{.AppSlug}}"
      data-cozy-tracking="{{.Tracking}}"
      data-cozy-icon-path="{{.IconPath}}"
      data-cozy-subdomain-type="{{.SubDomain}}"
      data-cozy-default-wallpaper="{{.DefaultWallpaper}}"
      data-cozy-flags="{{.Flags}}"
    >
      <script src="vendors/home.000f5f10d9fca3ceac41.js"></script>
      <script src="app/home.f6f22f0d747344045d69.js"></script>
      <script src="//{{.Domain}}/assets/js/piwik.js" async></script>
    </div>
  </body>
</html>
`

const expectedContent = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Cozy Home</title>
    <link rel="icon" href="https://URL_TO_FAVICON_ICO">
    <link rel="manifest" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/manifest.json" crossorigin="use-credentials" />
    <meta name="msapplication-TileColor" content="#2b5797" />
    <meta name="theme-color" content="#ffffff" />
    <meta
      name="viewport"
      content="width=device-width,height=device-height,initial-scale=1,viewport-fit=cover"
    />
    <link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors-home.4740287bb69e5ea49e26.0.min.css" />
    <link rel="stylesheet" href="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/app-home.53f72c970a7c14ef3a0c.min.css" />
    <link rel="stylesheet" href="https://claude.mycozy.cloud/assets/fonts/fonts.css" />
    <link rel="stylesheet" type="text/css" href="https://URL_TO_COZY_THEME_CSS"> <script src="https://URL_TO_COZY_CLIENT_JS"></script>
  </head>
  <body>
    <div
      role="application"
      data-cozy="SOME_COZY_DATA"
      data-cozy-token="SOME_TOKEN"
      data-cozy-domain="claude.mycozy.cloud"
      data-cozy-locale="fr"
      data-cozy-app-editor="Cozy"
      data-cozy-app-name="Accueil"
      data-cozy-app-name-prefix="Cozy"
      data-cozy-app-slug="home"
      data-cozy-tracking="false"
      data-cozy-icon-path="icon.svg"
      data-cozy-subdomain-type="flat"
      data-cozy-default-wallpaper="https://URL_TO_WALLPAPER"
      data-cozy-flags="{"harvest.datacards.files":true}"
    >
      <script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors/home.000f5f10d9fca3ceac41.js"></script>
      <script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/app/home.f6f22f0d747344045d69.js"></script>
      <script src="https://claude.mycozy.cloud/assets/js/piwik.js" async></script>
    </div>
  </body>
</html>
`

const fakeData = {
  Locale: 'fr',
  Favicon: `<link rel="icon" href="https://URL_TO_FAVICON_ICO">`,
  Domain: 'claude.mycozy.cloud',
  ThemeCSS: `<link rel="stylesheet" type="text/css" href="https://URL_TO_COZY_THEME_CSS">`,
  CozyClientJS: `<script src="https://URL_TO_COZY_CLIENT_JS"></script>`,
  CozyData: 'SOME_COZY_DATA',
  Token: 'SOME_TOKEN',
  AppEditor: 'Cozy',
  AppName: 'Accueil',
  AppNamePrefix: 'Cozy',
  AppSlug: 'home',
  Tracking: 'false',
  IconPath: 'icon.svg',
  SubDomain: 'flat',
  DefaultWallpaper: `https://URL_TO_WALLPAPER`,
  Flags: '{"harvest.datacards.files":true}'
}
