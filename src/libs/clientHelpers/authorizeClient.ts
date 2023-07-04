import type CozyClient from 'cozy-client'

import { queryResultToCrypto } from '/components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'
import { finalizeClientCreation } from '/libs/clientHelpers/createClient'
import {
  CozyClientCreationContext,
  STATE_CONNECTED
} from '/libs/clientHelpers/types'

interface PkceResult {
  codeVerifier: string
  codeChallenge: string
}

/**
 * Create and return a couple of PKCE keys
 * To make the PKCE creation possible, a CryptoWebView must be present in the ReactNative component tree
 *
 * @returns {object} message result from the CryptoWebView's `computePKCE` method
 * throws
 */
export const createPKCE = async (): Promise<PkceResult> => {
  return (await queryResultToCrypto('computePKCE', {})) as unknown as PkceResult
}

interface AuthorizeClientParams {
  client: CozyClient
  sessionCode: string
}

export const authorizeClient = async ({
  client,
  sessionCode
}: AuthorizeClientParams): Promise<void> => {
  const { codeVerifier, codeChallenge } = await createPKCE()

  await client.authorize({
    sessionCode: sessionCode,
    pkceCodes: {
      codeVerifier,
      codeChallenge
    }
  })
}

export const authorizeClientAndLogin = async ({
  client,
  sessionCode
}: AuthorizeClientParams): Promise<CozyClientCreationContext> => {
  await authorizeClient({ client, sessionCode })

  await finalizeClientCreation(client)

  return {
    client: client,
    state: STATE_CONNECTED
  }
}
