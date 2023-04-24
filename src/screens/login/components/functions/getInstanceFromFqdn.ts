const UNSECURE_DOMAINS = ['cozy.tools', 'localhost', 'nip.io'] as const

/**
 * Get Cozy Instance from FQDN
 *
 * Instance is computed from FQDN by adding a protocol to it
 *
 * 'cozy.tools', 'localhost', 'nip.io' URLs are enforced with
 * unsecure HTTP protocol
 *
 * @param fqdn - Cozy's FQDN
 * @returns the computed Instance URL as string
 */
export const getInstanceFromFqdn = (fqdn: string): string => {
  const instance = getURLWithEnforcedProtocol(fqdn)

  return removeTrailingSlash(instance.toString())
}

const getURLWithEnforcedProtocol = (uri: string): URL => {
  const uriWithProtocol = hasProtocol(uri) ? uri : `https://${uri}`
  const instance = new URL(uriWithProtocol)

  if (isUnsecureDomain(instance)) {
    instance.protocol = 'http'
  }

  return instance
}

const removeTrailingSlash = (value: string): string => {
  return value.replace(/\/$/, '')
}

const hasProtocol = (url: string): boolean => {
  return url.includes('://')
}

const isUnsecureDomain = (instance: URL): boolean => {
  return UNSECURE_DOMAINS.some(domain => instance.hostname.endsWith(domain))
}
