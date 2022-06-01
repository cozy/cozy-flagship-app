import { fillIndexWithData } from './indexGenerator'

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'SOME_DocumentDirectoryPath'
}))

describe('indexGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fillIndexWithData', () => {
    it(`to correctly fill cozy-home's index.html`, async () => {
      const result = await fillIndexWithData({
        fqdn: 'claude.mycozy.cloud',
        slug: 'home',
        port: 5757,
        securityKey: 'SOME_SECURITY_KEY',
        indexContent: rawContent,
        indexData: fakeData
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
          indexData: fakeData
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
          indexData: fakeData
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
          indexData: fakeData
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
          indexData: fakeData
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
          indexData: fakeData
        })

        expect(result).toBe(
          '<link rel="stylesheet" href="//claude.mycozy.cloud/vendors-home.4740287bb69e5ea49e26.0.min.css" />'
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
          indexData: fakeData
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
          indexData: fakeData
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
          indexData: fakeData
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
          indexData: fakeData
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
          indexData: fakeData
        })

        expect(result).toBe(
          '<script src="//claude.mycozy.cloud/vendors/home.000f5f10d9fca3ceac41.js"></script>'
        )
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
    <link rel="stylesheet" href="//claude.mycozy.cloud/assets/fonts/fonts.css" />
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
      data-cozy-flags="SOME_FLAGS"
    >
      <script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/vendors/home.000f5f10d9fca3ceac41.js"></script>
      <script src="http://localhost:5757/SOME_SECURITY_KEY/claude.mycozy.cloud/home/embedded/app/home.f6f22f0d747344045d69.js"></script>
      <script src="//claude.mycozy.cloud/assets/js/piwik.js" async></script>
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
  Flags: 'SOME_FLAGS'
}
