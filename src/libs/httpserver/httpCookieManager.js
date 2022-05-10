import CookieManager from '@react-native-cookies/cookies'

import { isSecureProtocol } from '../functions/isSecureProtocol'

const isCookieName = key => {
  return key === 'cozysessid' || key.startsWith('sess-')
}

const extractKeyValues = cookieString => {
  const keyValues = cookieString.split('; ').reduce((previous, current) => {
    const pair = current.split('=')

    const key = pair[0]
    const value = pair[1]

    if (isCookieName(key)) {
      return {
        ...previous,
        Name: key,
        Value: value
      }
    }

    return {
      ...previous,
      [key]: value || true
    }
  }, {})

  return keyValues
}

const parseCookie = cookieString => {
  const keyValues = extractKeyValues(cookieString)

  if (!keyValues.Name || !keyValues.Value) {
    throw new Error('Specified cookie does not contain any name=value')
  }

  const cookieDomain = keyValues.Domain

  if (!cookieDomain) {
    throw new Error('Specified cookie does not contain any domain')
  }

  return {
    name: keyValues.Name,
    value: keyValues.Value,
    domain: keyValues.Domain,
    path: keyValues.Path || '/',
    httpOnly: keyValues.HttpOnly || false
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
export const setCookie = async (cookieString, client) => {
  const cookie = parseCookie(cookieString)

  const appUrl = client.getStackClient().uri
  const isSecure = isSecureProtocol(client)

  const stackCookie = {
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    version: '1',
    secure: isSecure,
    httpOnly: cookie.httpOnly,
    sameSite: 'None' // This must be force to 'None' so iOS accepts to send it through "html injected" webview
  }

  return CookieManager.set(appUrl, stackCookie, true)
}
