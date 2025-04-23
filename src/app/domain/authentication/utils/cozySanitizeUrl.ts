const cozyDomain = '.mycozy.cloud'

const normalizeURL = (value: string, defaultDomain: string): string => {
  const valueWithProtocol = prependProtocol(value)
  const valueWithoutTrailingSlash = removeTrailingSlash(valueWithProtocol)
  const valueWithProtocolAndDomain = appendDomain(
    valueWithoutTrailingSlash,
    defaultDomain
  )

  const isDefaultDomain = new RegExp(`${defaultDomain}$`).test(
    valueWithProtocolAndDomain
  )

  return isDefaultDomain
    ? removeAppSlug(valueWithProtocolAndDomain)
    : valueWithProtocolAndDomain
}

const hasMispelledCozy = (value: string): boolean => value.includes('.mycosy.')

const appendDomain = (value: string, domain: string): string =>
  value.includes('.') ? value : `${value}${domain}`

const prependProtocol = (value: string): string =>
  /^http(s)?:\/\//.test(value) ? value : `https://${value}`

const removeAppSlug = (value: string): string => {
  const matchedSlugs = /^https?:\/\/\w+(-\w+)\./gi.exec(value)

  return matchedSlugs ? value.replace(matchedSlugs[1], '') : value
}

const removeTrailingSlash = (value: string): string => value.replace(/\/$/, '')

export const sanitizeUrlInput = (
  inputUrl: string,
  domain: string = cozyDomain
): string => {
  // Prevent empty url
  if (!inputUrl) {
    throw new Error('cozyUrlRequired')
  }
  // Prevent email input
  if (inputUrl.includes('@')) {
    throw new Error('noEmailAsCozyUrl')
  }

  if (hasMispelledCozy(inputUrl)) {
    throw new Error('hasMispelledCozy')
  }

  return normalizeURL(inputUrl, domain)
}
