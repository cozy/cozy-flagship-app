import flow from 'lodash/fp/flow'

import strings from '/strings.json'

const abort = 'https://urlwithnofqdn'

// We don't want to throw so if there is no request with url provided, we just pass an invalid url
export const validateRequest = request =>
  !request ? abort : !request.url ? abort : request.url

const trimWhitespaces = string => string?.replace(/\s/g, '')

const validateFqdn = fqdn => fqdn || null

const getFqdn = url =>
  new URL(window.decodeURIComponent(url)).searchParams.get(strings.fqdn)

const handleProtocol = url => {
  if (!url) {
    return null
  }

  try {
    return new URL(url).href
  } catch {
    return `${strings.defaultHttpScheme}${url}/`
  }
}

export const getUriFromRequest = req =>
  flow(
    validateRequest,
    getFqdn,
    validateFqdn,
    trimWhitespaces,
    handleProtocol
  )(req)
