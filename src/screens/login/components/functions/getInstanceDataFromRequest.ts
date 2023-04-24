import { WebViewNavigation } from 'react-native-webview'

import strings from '/constants/strings.json'

interface CozyFqndAndInstance {
  fqdn: string
  instance: string
}

const UNSECURE_DOMAINS = ['cozy.tools', 'localhost', 'nip.io'] as const

/**
 * Extract `fqdn` param from WebViewNavigation event and return `fqdn` and `instance` data
 *
 * This method is made for intercepting Cloudery navigations
 * like `https://loginflagship/?fqdn=claude.mycozy.cloud`
 * of like `https://loginflagship/?fqdn=http://claude.cozy.tools:8080`
 *
 * returned fqdn will be in the Cozy FQDN format (no protocol)
 * returned instance will be in the Cozy Instance format (full URL origin)
 *
 * @param req - Navigation event intercepted by a WebView
 * @returns Cozy's Instance data containing FQDN and Instance url
 */
export const getInstanceDataFromRequest = (
  req?: WebViewNavigation
): CozyFqndAndInstance | null => {
  const fqdnParam = getFqdnFromRequest(req)

  if (!fqdnParam) {
    return null
  }

  const instance = getInstanceFromFqdn(fqdnParam)

  // since fqdnParam may contain a protocol, we use URL to remove it
  const fqdn = new URL(instance).host

  return {
    fqdn,
    instance
  }
}

const getFqdnFromRequest = (req?: WebViewNavigation): string | null => {
  const navigationUrl = req?.url

  if (!navigationUrl) {
    return null
  }

  const url = new URL(navigationUrl)

  const fqdn = url.searchParams.get(strings.fqdn)

  if (!fqdn) {
    return null
  }

  return trimWhitespaces(fqdn).toLocaleLowerCase()
}

const getInstanceFromFqdn = (fqdn: string): string => {
  const fqdnWithProtocol = hasProtocol(fqdn) ? fqdn : `https://${fqdn}`
  const instance = new URL(fqdnWithProtocol)

  if (UNSECURE_DOMAINS.some(domain => instance.hostname.endsWith(domain))) {
    instance.protocol = 'http'
  }

  return removeTrailingSlash(instance.toString())
}

const hasProtocol = (url: string): boolean => {
  return url.includes('://')
}

const removeTrailingSlash = (value: string): string => {
  return value.replace(/\/$/, '')
}

const trimWhitespaces = (value: string): string => {
  return value.replace(/\s/g, '')
}
