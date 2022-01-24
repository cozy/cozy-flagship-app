import AsyncStorage from '@react-native-async-storage/async-storage'
import {generateWebLink} from 'cozy-client'

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

const getSessionToken = async () => {
  try {
    const token = await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG)
    return token
  } catch (error) {
    return false
  }
}

const validateRedirect = async (client, subDomainType, uri) => {
  if (!subDomainType) {
    return uri
  }

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
  }

  if (subDomainType === 'nested') {
    if (modelArray[1] !== inputArray[1]) {
      _throw(strings.errors.cozyClientMismatch)
    }
  }

  return uri
}

const fetchSessionCode = client => async () =>
  (await client.getStackClient().fetchSessionCode()).session_code

const wrapUrl = (client, subdomain) => async uri =>
  validateRedirect(
    client,
    subdomain,
    appendParams(uri, strings.SESSION_CODE, await fetchSessionCode(client)()),
  )

export const shouldCreateSession = async () => !(await getSessionToken())

export const handleCreateSession = client => uri => wrapUrl(client)(uri)

export const shouldInterceptAuth = client => url =>
  url.includes(`${client.getStackClient().uri}${strings.authLogin}`)

export const handleInterceptAuth = (client, subdomain) => url =>
  wrapUrl(client, subdomain)(new URL(url))

export const consumeSessionToken = () =>
  AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')

export const resetSessionToken = () =>
  AsyncStorage.removeItem(strings.SESSION_CREATED_FLAG)
