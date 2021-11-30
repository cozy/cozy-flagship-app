import strings from '../../strings.json'

const abort = 'https://urlwithnofqdn'

// We don't want to throw so if there is no request with url provided, we just pass an invalid url
// This function is not meant to be exported, it can be seen as a private "method" of getUriFromRequest()
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
