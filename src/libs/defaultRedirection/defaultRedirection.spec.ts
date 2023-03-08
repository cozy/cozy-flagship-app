import AsyncStorage from '@react-native-async-storage/async-storage'

import CozyClient, { createMockClient } from 'cozy-client'

import strings from '/constants/strings.json'
import * as DefaultRedirection from '/libs/defaultRedirection/defaultRedirection'
import {
  NAVIGATION_APP_SLUG,
  DEFAULT_REDIRECTION_DELAY_IN_MS,
  InstanceSettings,
  isDefaultRedirectionUrlNavigationApp,
  fetchDefaultRedirectionUrl,
  setDefaultRedirectionUrl,
  getDefaultRedirectionUrl,
  fetchAndSetDefaultRedirectionUrl,
  fetchAndSetDefaultRedirectionUrlInBackground,
  getOrFetchDefaultRedirectionUrl
} from '/libs/defaultRedirection/defaultRedirection'
import { formatRedirectLink } from '/libs/functions/formatRedirectLink'

jest.mock('@react-native-async-storage/async-storage')
jest.mock('/libs/functions/formatRedirectLink')

const mockedFormatRedirectLink = formatRedirectLink as jest.MockedFunction<
  typeof formatRedirectLink
>

const NAVIGATION_APP_URL = `http://${NAVIGATION_APP_SLUG}.mycozy.test/#/`
const DRIVE_URL = 'http://drive.mycozy.test/#/folder'
const CONTACT_URL = 'http://contacts.mycozy.test/#/'

describe('isDefaultRedirectionUrlNavigationApp', () => {
  const client = createMockClient({}) as CozyClient
  client.capabilities = {
    flat_subdomains: false
  }

  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should return true if slug of default redirection url is same than navigation app', () => {
    expect(
      isDefaultRedirectionUrlNavigationApp(NAVIGATION_APP_URL, client)
    ).toBe(true)
  })

  it('should return false if slug of default redirection url is different than navigation app', () => {
    expect(isDefaultRedirectionUrlNavigationApp(DRIVE_URL, client)).toBe(false)
  })
})

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
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      strings.DEFAULT_REDIRECTION_URL_STORAGE_KEY,
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
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(
      strings.DEFAULT_REDIRECTION_URL_STORAGE_KEY
    )
  })
})

describe('fetchAndSetDefaultRedirectionUrl', () => {
  const client = createMockClient({}) as CozyClient

  beforeAll(() => {
    jest.resetAllMocks()
  })

  it('should set default redirection url if fetch return correct value', async () => {
    jest
      .spyOn(DefaultRedirection, 'fetchDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(DRIVE_URL))

    const spy = jest.spyOn(DefaultRedirection, 'setDefaultRedirectionUrl')
    await fetchAndSetDefaultRedirectionUrl(client)
    expect(spy).toHaveBeenCalled()
  })

  it('should not set default redirection url if fetch return incorrect value', async () => {
    jest
      .spyOn(DefaultRedirection, 'fetchDefaultRedirectionUrl')
      .mockReturnValue(Promise.resolve(null))

    const spy = jest.spyOn(DefaultRedirection, 'setDefaultRedirectionUrl')
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

  let spyFetchAndSetDefaultRedirectionUrlInBackground: jest.SpyInstance<
    Promise<void>,
    [client: CozyClient, delayInMs?: number | undefined]
  >

  beforeAll(() => {
    jest.resetAllMocks()

    jest
      .spyOn(DefaultRedirection, 'isDefaultRedirectionUrlNavigationApp')
      .mockImplementation(() => false)

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
