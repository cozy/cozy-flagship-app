import AsyncStorage from '@react-native-async-storage/async-storage'
import Minilog from 'cozy-minilog'

const log = Minilog('SessionScript')
Minilog.enable()

import strings from '/constants/strings.json'
import { isSameCozy } from '/libs/functions/urlHelpers'

const _throw = message => {
  throw new Error(message)
}

const appendParams = (url, key, value) => {
  const searchParamsRedirect = url.searchParams.get(strings.REDIRECT)

  if (searchParamsRedirect === '' || !url) {
    return _throw(strings.errorAppendParamsFail)
  }

  const appendedURL = new URL(searchParamsRedirect || `${url}`)

  appendedURL.searchParams.append(key, value)
  appendedURL.hash = url.hash

  return `${appendedURL}`
}

const validateRedirect = async (cozyUrl, subDomainType, destinationUrl) => {
  if (isSameCozy({ cozyUrl, destinationUrl, subDomainType }))
    return destinationUrl
  else _throw(strings.errors.cozyClientMismatch)
}

const fetchSessionCode = async client => {
  const { session_code } = await client.getStackClient().fetchSessionCode()

  return session_code
}

const wrapUrl = async (client, uri) => {
  const sessionCode = await fetchSessionCode(client)

  return appendParams(new URL(uri), strings.SESSION_CODE, sessionCode)
}

const shouldCreateSession = async () => {
  try {
    const sessionCreatedFlag = await AsyncStorage.getItem(
      strings.SESSION_CREATED_FLAG
    )

    return !sessionCreatedFlag
  } catch (error) {
    log.error(`Error when reading the AsyncStorage : ${error.toString()}`)

    return false
  }
}

const consumeSessionToken = () =>
  AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')

const resetSessionToken = () =>
  AsyncStorage.removeItem(strings.SESSION_CREATED_FLAG)

// Higher-order functions
const handleInterceptAuth = (client, subdomain) => async url => {
  const wrappedUrl = await wrapUrl(client, url)

  return validateRedirect(client.getStackClient().uri, subdomain, wrappedUrl)
}

const handleCreateSession = client => async uri => await wrapUrl(client, uri)

const shouldInterceptAuth = client => url =>
  url.startsWith(`${client.getStackClient().uri}${strings.authLogin}`)

// Function factory taking environment values as parameters
const makeSessionAPI = (client, subDomainType) => ({
  consumeSessionToken,
  handleCreateSession: handleCreateSession(client),
  handleInterceptAuth: handleInterceptAuth(client, subDomainType),
  resetSessionToken,
  shouldCreateSession,
  shouldInterceptAuth: shouldInterceptAuth(client),
  subDomainType
})
// Exposed API
export { makeSessionAPI, resetSessionToken }
