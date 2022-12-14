import AsyncStorage from '@react-native-async-storage/async-storage'
import CookieManager, { Cookie, Cookies } from '@react-native-cookies/cookies'
import CozyClient from 'cozy-client'

import { isSecureProtocol } from '../functions/isSecureProtocol'

import strings from '/strings.json'

type CookieRecord = Record<string, string>

const isCookieName = (key: string): boolean => {
  return key === 'cozysessid' || key.startsWith('sess-')
}

const extractKeyValues = (cookieString: string): CookieRecord => {
  const keyValues = cookieString.split('; ').reduce((previous, current) => {
    const pair = current.split('=')

    const key = pair[0]
    const value = pair[1]

    if (!key) {
      throw new Error('Error while parsing cookieString')
    }

    if (isCookieName(key)) {
      return {
        ...previous,
        Name: key,
        Value: value
      }
    }

    return {
      ...previous,
      [key]: value ?? true
    }
  }, {})

  return keyValues
}

const parseCookie = (cookieString: string): Cookie => {
  const keyValues = extractKeyValues(cookieString)

  if (!keyValues.Name || !keyValues.Value) {
    throw new Error('Specified cookie does not contain any name=value')
  }

  let cookieDomain = keyValues.Domain

  if (!cookieDomain) {
    throw new Error('Specified cookie does not contain any domain')
  }

  if (!cookieDomain.startsWith('.')) {
    // iOS requires the domain to starts with a . in order to load it
    cookieDomain = `.${cookieDomain}`
  }

  return {
    name: keyValues.Name,
    value: keyValues.Value,
    domain: cookieDomain,
    path: keyValues.Path ?? '/',
    httpOnly: Boolean(keyValues.HttpOnly)
  }
}

/**
 * Set the cookie into the device by using CookieManager
 *
 * The given cookie is parsed before being injected
 *
 * Note that `CookieManager.setFromResponse` method cannot be used here
 * If we inject the raw cookie from cozy-stack, then iOS Safari's protections
 * will prevent to load the cookie
 * Also we need to force `sameSite` to `None` and edit `secure` to fit the client's
 * protocol before injecting it
 *
 * @param {string} cookieString - Cookie string returned from cozy-stack
 * @param {CozyClient} client - CozyClient instance
 * @returns {Promise<boolean>}
 */
export const setCookie = async (
  cookieString: string,
  client: CozyClient
): Promise<boolean> => {
  const cookie = parseCookie(cookieString)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const appUrl: string = client.getStackClient().uri
  const isSecure = isSecureProtocol(client)

  const expireDate = new Date()
  expireDate.setFullYear(expireDate.getFullYear() + 10)

  const stackCookie = {
    name: cookie.name,
    expires: expireDate.toISOString(),
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    version: '1',
    secure: isSecure,
    httpOnly: cookie.httpOnly,
    sameSite: 'None' // This must be force to 'None' so iOS accepts to send it through "html injected" webview
  }

  await setCookieIntoAsyncStorage(client, stackCookie)

  return CookieManager.set(appUrl, stackCookie, true)
}

export const getCookie = async (
  client: CozyClient
): Promise<Cookie | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const appUrl: string = client.getStackClient().uri

  const cookies = await loadCookiesFromAsyncStorage()

  return cookies[appUrl]
}

/**
 * Re-fill CookieManager by using cookie stored in AsyncStorage
 *
 * @param {CozyClient} client - CozyClient instance
 * @returns {Promise<boolean>}
 */
export const resyncCookies = async (client: CozyClient): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const appUrl: string = client.getStackClient().uri

  const cookies = await loadCookiesFromAsyncStorage()

  const stackCookie = cookies[appUrl]

  if (stackCookie) {
    await CookieManager.set(appUrl, stackCookie, true)
  }
}

export const clearCookies = async (): Promise<void> => {
  await AsyncStorage.removeItem(strings.COOKIE_STORAGE_KEY)

  await CookieManager.clearAll()
}

const setCookieIntoAsyncStorage = async (
  client: CozyClient,
  cookie: Cookie
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const appUrl: string = client.getStackClient().uri

  const cookies = await loadCookiesFromAsyncStorage()
  cookies[appUrl] = cookie

  return saveCookies(cookies)
}

const loadCookiesFromAsyncStorage = async (): Promise<Cookies> => {
  const state = await AsyncStorage.getItem(strings.COOKIE_STORAGE_KEY)

  if (!state) {
    return {}
  }

  const cookies = JSON.parse(state) as Cookies

  return cookies
}

const saveCookies = (cookies: Cookies): Promise<void> => {
  const state = JSON.stringify(cookies)
  return AsyncStorage.setItem(strings.COOKIE_STORAGE_KEY, state)
}
