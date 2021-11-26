import strings from '../../strings.json'

const abort = 'https://abort'

const validateRequest = (request) =>
  !request ? abort : !request.url ? abort : request.url

const validateFqdn = (fqdn) => fqdn || null

const getFqdn = (url) =>
  new URL(window.decodeURIComponent(url)).searchParams.get(
    strings.loginQueryString,
  )

const handleProtocol = (url) => {
  if (!url) {
    return url
  }

  try {
    return new URL(url).href
  } catch {
    return `${strings.defaultScheme}${url}/`
  }
}

export const getUriFromRequest = (request) =>
  handleProtocol(validateFqdn(getFqdn(validateRequest(request))))
