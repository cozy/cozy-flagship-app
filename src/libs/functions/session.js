import AsyncStorage from '@react-native-async-storage/async-storage'

import Minilog from '@cozy/minilog'
import {generateWebLink} from 'cozy-client'

const log = Minilog('SessionScript')
Minilog.enable()

import strings from '../../strings.json'

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

const validateRedirect = async (client, subDomainType, uri) => {
  const webLink = generateWebLink({
    cozyUrl: client.getStackClient().uri,
    pathname: '/',
    slug: 'slug',
    subDomainType,
  })

  const modelURL = new URL(webLink)
  const inputUrl = new URL(uri)

  if (inputUrl.protocol !== modelURL.protocol) {
    _throw(strings.errors.protocolMismatch)
  }

  const modelArray = modelURL.hostname.split('.')
  const inputArray = inputUrl.hostname.split('.')

  if (`${modelArray.slice(1)}` !== `${inputArray.slice(1)}`) {
    _throw(strings.errors.domainMismatch)
  }

  if (subDomainType === 'flat') {
    if (modelArray[0].split('-')[0] !== inputArray[0].split('-')[0]) {
      _throw(strings.errors.cozyClientMismatch)
    }
  } else if (subDomainType === 'nested') {
    if (modelArray[1] !== inputArray[1]) {
      _throw(strings.errors.cozyClientMismatch)
    }
  }

  return uri
}

const fetchSessionCode = async client => {
  const {session_code} = await client.getStackClient().fetchSessionCode()

  return session_code
}

const wrapUrl = async (client, uri) => {
  const sessionCode = await fetchSessionCode(client)

  return appendParams(new URL(uri), strings.SESSION_CODE, sessionCode)
}

const shouldCreateSession = async () => {
  try {
    const sessionCreatedFlag = await AsyncStorage.getItem(
      strings.SESSION_CREATED_FLAG,
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

  return validateRedirect(client, subdomain, wrappedUrl)
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
})

// Exposed API
export {makeSessionAPI, resetSessionToken}
