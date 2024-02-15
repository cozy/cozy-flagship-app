import type CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import strings from '/constants/strings.json'
import { isSameCozy } from '/libs/functions/urlHelpers'
import {
  StorageKeys,
  getData,
  storeData,
  removeData
} from '/libs/localStore/storage'

const log = Minilog('SessionScript')

// @ts-expect-error : cozy-minilog has to be updated
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
Minilog.enable()

const _throw = (message: string): never => {
  throw new Error(message)
}

const appendParams = (url: URL | null, key: string, value: string): string => {
  const searchParamsRedirect = url?.searchParams.get(strings.REDIRECT)

  if (searchParamsRedirect === '' || !url) {
    return _throw(strings.errorAppendParamsFail)
  }

  const appendedURL = new URL(searchParamsRedirect ?? `${url.toString()}`)

  appendedURL.searchParams.append(key, value)
  appendedURL.hash = url.hash

  return `${appendedURL.toString()}`
}

const validateRedirect = (
  cozyUrl: string,
  subDomainType: string,
  destinationUrl: string
): string | undefined => {
  if (isSameCozy({ cozyUrl, destinationUrl, subDomainType }))
    return destinationUrl
  else _throw(strings.errors.cozyClientMismatch)
}

const fetchSessionCode = async (client: CozyClient): Promise<string> => {
  const { session_code } = await client.getStackClient().fetchSessionCode()

  return session_code
}

const wrapUrl = async (
  client: CozyClient,
  uri: URL | string
): Promise<string> => {
  const sessionCode = await fetchSessionCode(client)

  return appendParams(new URL(uri), strings.SESSION_CODE, sessionCode)
}

const shouldCreateSession = async (): Promise<boolean> => {
  try {
    const sessionCreatedFlag = await getData(StorageKeys.SessionCreated)

    return !sessionCreatedFlag
  } catch (error) {
    log.error(`Error when reading the AsyncStorage : ${getErrorMessage(error)}`)

    return false
  }
}

const consumeSessionToken = (): Promise<void> =>
  storeData(StorageKeys.SessionCreated, '1')

const resetSessionToken = (): Promise<void> =>
  removeData(StorageKeys.SessionCreated)

// Higher-order functions
const handleInterceptAuth =
  (client: CozyClient, subdomain: string) =>
  async (url: string): Promise<string | undefined> => {
    const wrappedUrl = await wrapUrl(client, url)

    return validateRedirect(client.getStackClient().uri, subdomain, wrappedUrl)
  }

const handleCreateSession =
  (client: CozyClient) =>
  async (uri: URL): Promise<string> =>
    await wrapUrl(client, uri)

const shouldInterceptAuth =
  (client: CozyClient) =>
  (url: string): boolean =>
    url.startsWith(`${client.getStackClient().uri}${strings.authLogin}`)

export interface SessionApi {
  consumeSessionToken: () => Promise<void>
  handleCreateSession: (uri: URL) => Promise<string>
  handleInterceptAuth: (url: string) => Promise<string | undefined>
  resetSessionToken: () => Promise<void>
  shouldCreateSession: () => Promise<boolean>
  shouldInterceptAuth: (url: string) => boolean
  subDomainType: string
}

// Function factory taking environment values as parameters
const makeSessionAPI = (
  client: CozyClient,
  subDomainType: string
): SessionApi => ({
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
