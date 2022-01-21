import AsyncStorage from '@react-native-async-storage/async-storage'

import strings from '../../strings.json'

const _throw = message => {
  throw new Error(message)
}

const appendParams = (uri, key, value) => {
  if (!uri) {
    return _throw(strings.errorAppendParamsFail)
  }

  try {
    const url = new URL(uri.toString())
    url.searchParams.append(key, value)

    return url.toString()
  } catch (error) {
    return `${uri}/?${key}=${value}`
  }
}

const getSessionToken = async () => {
  try {
    const token = await AsyncStorage.getItem(strings.SESSION_CREATED_FLAG)
    return token
  } catch (error) {
    return false
  }
}

const fetchSessionCode = client => async () =>
  (await client.getStackClient().fetchSessionCode()).session_code

const wrapUrl = client => async uri =>
  appendParams(uri, strings.SESSION_CODE, await fetchSessionCode(client)())

export const shouldCreateSession = async () => !(await getSessionToken())

export const handleCreateSession = client => uri => wrapUrl(client)(uri)

export const shouldInterceptAuth = client => url =>
  url.includes(`${client.getStackClient().uri}${strings.authLogin}`)

export const handleInterceptAuth = client => url =>
  wrapUrl(client)(new URL(url).searchParams.get(strings.REDIRECT))

export const consumeSessionToken = () =>
  AsyncStorage.setItem(strings.SESSION_CREATED_FLAG, '1')

export const resetSessionToken = () =>
  AsyncStorage.removeItem(strings.SESSION_CREATED_FLAG)
