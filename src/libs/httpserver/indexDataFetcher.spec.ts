import CozyClient from 'cozy-client'

import { fetchAppDataForSlug } from '/libs/httpserver/indexDataFetcher'
import { fetchCozyDataForSlug } from '/libs/client'

jest.mock('../client', () => ({
  fetchCozyDataForSlug: jest.fn()
}))

jest.mock('@react-native-cookies/cookies', () => ({
  set: jest.fn()
}))

const mockedFetchCozyDataForSlug = fetchCozyDataForSlug as jest.MockedFunction<
  typeof fetchCozyDataForSlug<StackResultData>
>

describe('indexDataFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchAppDataForSlug', () => {
    it(`should correctly convert result from cozy-stack into expected data format`, async () => {
      const client = {
        getStackClient: (): { uri: string } => ({
          uri: 'http://localhost:8080'
        })
      } as CozyClient

      mockedFetchCozyDataForSlug.mockResolvedValue(mockStackResult)

      const result = await fetchAppDataForSlug('home', client)

      expect(result).toStrictEqual(expectedResult)
    })
  })
})

interface StackResultData {
  type: string
  id: string
  attributes: Record<string, string>
  meta: unknown
  links: {
    self: string
  }
}

interface StackResult {
  source: 'stack'
  data: StackResultData
}

const mockStackResult: StackResult = {
  source: 'stack',
  data: {
    type: 'io.cozy.apps.open',
    id: 'home',
    attributes: {
      AppEditor: 'Cozy',
      AppName: 'Home',
      AppNamePrefix: 'Cozy',
      AppSlug: 'home',
      Capabilities:
        '{"file_versioning":true,"flat_subdomains":false,"can_auth_with_password":true,"can_auth_with_oidc":false}',
      Cookie: 'SOME_COOKIE',
      CozyBar: '<script src="https://URL_TO_COZY_BAR_JS"></script>',
      CozyClientJS: '<script src="https://URL_TO_COZY_CLIENT_JS"></script>',
      DefaultWallpaper: 'https://URL_TO_WALLPAPER',
      Domain: 'cozy.10-0-2-2.nip.io:8080',
      Favicon: '<link rel="icon" href="https://URL_TO_FAVICON_ICO.ico">',
      Flags: '{"harvest.datacards.files":true}',
      IconPath: 'icon.svg',
      Locale: 'en',
      SubDomain: 'nested',
      ThemeCSS:
        '<link rel="stylesheet" type="text/css" href="https://URL_TO_COZY_THEME_CSS">',
      Token: 'SOME_TOKEN',
      Tracking: 'false'
    },
    meta: {},
    links: {
      self: '/apps/home/open'
    }
  }
}

const expectedResult = {
  cookie: 'SOME_COOKIE',
  source: 'stack',
  templateValues: {
    AppEditor: 'Cozy',
    AppName: 'Home',
    AppNamePrefix: 'Cozy',
    AppSlug: 'home',
    Capabilities:
      '{&#34;file_versioning&#34;:true,&#34;flat_subdomains&#34;:false,&#34;can_auth_with_password&#34;:true,&#34;can_auth_with_oidc&#34;:false}',
    CozyBar: '<script src="https://URL_TO_COZY_BAR_JS"></script>',
    CozyClientJS: '<script src="https://URL_TO_COZY_CLIENT_JS"></script>',
    CozyData:
      '{&#34;app&#34;:{&#34;editor&#34;:&#34;Cozy&#34;,&#34;icon&#34;:&#34;icon.svg&#34;,&#34;name&#34;:&#34;Home&#34;,&#34;prefix&#34;:&#34;Cozy&#34;,&#34;slug&#34;:&#34;home&#34;},&#34;capabilities&#34;:{&#34;file_versioning&#34;:true,&#34;flat_subdomains&#34;:false,&#34;can_auth_with_password&#34;:true,&#34;can_auth_with_oidc&#34;:false},&#34;domain&#34;:&#34;cozy.10-0-2-2.nip.io:8080&#34;,&#34;flags&#34;:{&#34;harvest.datacards.files&#34;:true},&#34;locale&#34;:&#34;en&#34;,&#34;subdomain&#34;:&#34;nested&#34;,&#34;token&#34;:&#34;SOME_TOKEN&#34;,&#34;tracking&#34;:&#34;false&#34;}',
    DefaultWallpaper: 'https://URL_TO_WALLPAPER',
    Domain: 'cozy.10-0-2-2.nip.io:8080',
    Favicon: `<link rel="icon" href="https://URL_TO_FAVICON_ICO.ico">`,
    Flags: '{&#34;harvest.datacards.files&#34;:true}',
    IconPath: 'icon.svg',
    Locale: 'en',
    SubDomain: 'nested',
    ThemeCSS:
      '<link rel="stylesheet" type="text/css" href="https://URL_TO_COZY_THEME_CSS">',
    Token: 'SOME_TOKEN',
    Tracking: 'false'
  }
}
