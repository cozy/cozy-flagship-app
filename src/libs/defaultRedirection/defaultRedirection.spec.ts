import CozyClient, { createMockClient } from 'cozy-client'

import * as DefaultRedirection from '/libs/defaultRedirection/defaultRedirection'
import {
  NAVIGATION_APP_SLUG,
  DEFAULT_REDIRECTION_DELAY_IN_MS,
  InstanceSettings,
  fetchDefaultRedirectionUrl,
  setDefaultRedirectionUrl,
  getDefaultRedirectionUrl,
  setDefaultRedirectionUrlAndAppIcon,
  setDefaultRedirection,
  fetchAndSetDefaultRedirectionUrl,
  fetchAndSetDefaultRedirectionUrlInBackground,
  getOrFetchDefaultRedirectionUrl,
  getParamsWithDefaultRedirectionUrl
} from '/libs/defaultRedirection/defaultRedirection'
import { changeIcon } from '/libs/icon/icon'
import { formatRedirectLink } from '/libs/functions/formatRedirectLink'
import {
  CozyPersistedStorageKeys,
  getData,
  storeData
} from '/libs/localStore/storage'

jest.mock('/libs/localStore/storage')
jest.mock('/libs/icon/icon')
jest.mock('/libs/functions/formatRedirectLink')

const mockedFormatRedirectLink = formatRedirectLink as jest.MockedFunction<
  typeof formatRedirectLink
>

const NAVIGATION_APP_URL = `http://${NAVIGATION_APP_SLUG}.mycozy.test/#/alan`
const NAVIGATION_APP_URL_FLAT = `http://mycozy-${NAVIGATION_APP_SLUG}.test/#/alan`
const DRIVE_URL = 'http://drive.mycozy.test/#/folder'
const DRIVE_URL_FLAT = 'http://mycozy-drive.test/#/folder'
const CONTACT_URL = 'http://contacts.mycozy.test/#/'

describe('fetchDefaultRedirectionUrl', () => {
  const client = createMockClient({}) as CozyClient

  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should return default redirection url if request was good', async () => {
    client.query = async (): Promise<InstanceSettings> => {
      return Promise.resolve({
        data: {
          attributes: {
            default_redirection: 'drive/#/folder'
          }
        }
      })
    }

    mockedFormatRedirectLink.mockReturnValue(DRIVE_URL)

    const defaultRedirectionUrl = await fetchDefaultRedirectionUrl(client)

    expect(formatRedirectLink).toHaveBeenCalled()
    expect(defaultRedirectionUrl).toBe(DRIVE_URL)
  })

  it('should return null if request was bad', async () => {
    client.query = async (): Promise<object> => {
      return Promise.resolve({
        data: {}
      })
    }

    mockedFormatRedirectLink.mockReturnValue(DRIVE_URL)

    const defaultRedirectionUrl = await fetchDefaultRedirectionUrl(client)

    expect(formatRedirectLink).not.toHaveBeenCalled()
    expect(defaultRedirectionUrl).toBe(null)
  })
})

describe('setDefaultRedirectionUrl', () => {
  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should set default redirection url in async storage', async () => {
    await setDefaultRedirectionUrl(DRIVE_URL)
    expect(storeData).toHaveBeenCalledWith(
      CozyPersistedStorageKeys.DefaultRedirectionUrl,
      DRIVE_URL
    )
  })
})

describe('getDefaultRedirectionUrl', () => {
  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should get default redirection url in async storage', async () => {
    await getDefaultRedirectionUrl()
    expect(getData).toHaveBeenCalledWith(
      CozyPersistedStorageKeys.DefaultRedirectionUrl
    )
  })
})

describe('setDefaultRedirectionUrlAndAppIcon', () => {
  const client = createMockClient({}) as CozyClient

  client.capabilities = {
    flat_subdomains: false
  }

  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should set default redirection url in async storage and app icon', async () => {
    await setDefaultRedirectionUrlAndAppIcon(DRIVE_URL, client)
    expect(storeData).toHaveBeenCalledWith(
      CozyPersistedStorageKeys.DefaultRedirectionUrl,
      DRIVE_URL
    )
    expect(changeIcon).toHaveBeenCalledWith('drive')
  })
})

describe('setDefaultRedirection', () => {
  const client = createMockClient({}) as CozyClient

  client.capabilities = {
    flat_subdomains: false
  }

  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should set default redirection in async storage', async () => {
    mockedFormatRedirectLink.mockReturnValue(DRIVE_URL)
    await setDefaultRedirection('drive/', client)
    expect(storeData).toHaveBeenCalledWith(
      CozyPersistedStorageKeys.DefaultRedirectionUrl,
      DRIVE_URL
    )
  })
})

describe('fetchAndSetDefaultRedirectionUrl', () => {
  const client = createMockClient({}) as CozyClient

  client.capabilities = {
    flat_subdomains: false
  }

  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should set default redirection url if fetch return correct value', async () => {
    jest
      .spyOn(DefaultRedirection, 'fetchDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(DRIVE_URL))

    const spy = jest.spyOn(
      DefaultRedirection,
      'setDefaultRedirectionUrlAndAppIcon'
    )
    await fetchAndSetDefaultRedirectionUrl(client)
    expect(spy).toHaveBeenCalled()
  })

  it('should not set default redirection url if fetch return incorrect value', async () => {
    jest
      .spyOn(DefaultRedirection, 'fetchDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(null))

    const spy = jest.spyOn(
      DefaultRedirection,
      'setDefaultRedirectionUrlAndAppIcon'
    )
    await fetchAndSetDefaultRedirectionUrl(client)
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('fetchAndSetDefaultRedirectionUrlInBackground', () => {
  const client = createMockClient({}) as CozyClient

  beforeAll(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should fetch and set default redirection url after delay', () => {
    const spyFetchAndSetDefaultRedirectionUrl = jest.spyOn(
      DefaultRedirection,
      'fetchAndSetDefaultRedirectionUrl'
    )
    void fetchAndSetDefaultRedirectionUrlInBackground(
      client,
      DEFAULT_REDIRECTION_DELAY_IN_MS
    )

    jest.runAllTimers()

    expect(spyFetchAndSetDefaultRedirectionUrl).toHaveBeenCalled()
  })
})

describe('getOrFetchDefaultRedirectionUrl', () => {
  const client = createMockClient({}) as CozyClient

  client.capabilities = {
    flat_subdomains: false
  }

  let spyFetchAndSetDefaultRedirectionUrlInBackground: jest.SpyInstance<
    Promise<void>,
    [client: CozyClient, delayInMs?: number | undefined]
  >

  beforeAll(() => {
    jest.restoreAllMocks()

    spyFetchAndSetDefaultRedirectionUrlInBackground = jest
      .spyOn(DefaultRedirection, 'fetchAndSetDefaultRedirectionUrlInBackground')
      .mockReturnValue(Promise.resolve(undefined))
  })

  it('should fetch later if default redirection url in async storage', async () => {
    jest
      .spyOn(DefaultRedirection, 'getDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(DRIVE_URL))

    const spyFetchDefaultRedirectionUrl = jest
      .spyOn(DefaultRedirection, 'fetchDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(null))

    const defaultRedirectionUrl = await getOrFetchDefaultRedirectionUrl(client)

    expect(defaultRedirectionUrl).toBe(DRIVE_URL)
    expect(spyFetchDefaultRedirectionUrl).not.toHaveBeenCalled()
    expect(spyFetchAndSetDefaultRedirectionUrlInBackground).toHaveBeenCalled()
  })

  it('should fetch now if nothing in async storage', async () => {
    jest
      .spyOn(DefaultRedirection, 'getDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(null))

    const spyFetchDefaultRedirectionUrl = jest
      .spyOn(DefaultRedirection, 'fetchDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(CONTACT_URL))

    const defaultRedirectionUrl = await getOrFetchDefaultRedirectionUrl(client)

    expect(defaultRedirectionUrl).toBe(CONTACT_URL)
    expect(spyFetchDefaultRedirectionUrl).toHaveBeenCalled()
    expect(
      spyFetchAndSetDefaultRedirectionUrlInBackground
    ).not.toHaveBeenCalled()
  })
})

describe('getParamsWithDefaultRedirectionUrl', () => {
  beforeAll(() => {
    jest.resetAllMocks()
  })

  describe('with nested subdomain', () => {
    const client = createMockClient({}) as CozyClient

    client.capabilities = {
      flat_subdomains: false
    }

    it('should return undefined urls if default redirection url is null', () => {
      expect(getParamsWithDefaultRedirectionUrl(null, client)).toMatchObject({
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: undefined
      })
    })

    it('should return default redirection url for main app if default redirection url slug = navigation app slug', () => {
      expect(
        getParamsWithDefaultRedirectionUrl(NAVIGATION_APP_URL, client)
      ).toMatchObject({
        mainAppFallbackURL: NAVIGATION_APP_URL,
        cozyAppFallbackURL: undefined
      })
    })

    it('should return default redirection url for main app if default redirection url slug = navigation app slug', () => {
      expect(
        getParamsWithDefaultRedirectionUrl(DRIVE_URL, client)
      ).toMatchObject({
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: DRIVE_URL
      })
    })
  })

  describe('with flat subdomain', () => {
    const client = createMockClient({}) as CozyClient

    client.capabilities = {
      flat_subdomains: true
    }

    it('should return undefined urls if default redirection url is null', () => {
      expect(getParamsWithDefaultRedirectionUrl(null, client)).toMatchObject({
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: undefined
      })
    })

    it('should return default redirection url for main app if default redirection url slug = navigation app slug', () => {
      expect(
        getParamsWithDefaultRedirectionUrl(NAVIGATION_APP_URL_FLAT, client)
      ).toMatchObject({
        mainAppFallbackURL: NAVIGATION_APP_URL_FLAT,
        cozyAppFallbackURL: undefined
      })
    })

    it('should return default redirection url for main app if default redirection url slug = navigation app slug', () => {
      expect(
        getParamsWithDefaultRedirectionUrl(DRIVE_URL_FLAT, client)
      ).toMatchObject({
        mainAppFallbackURL: undefined,
        cozyAppFallbackURL: DRIVE_URL_FLAT
      })
    })
  })
})
