import type CozyClient from 'cozy-client'

import { createPKCE } from '/libs/clientHelpers/authorizeClient'
import { createClient } from '/libs/clientHelpers/createClient'
import {
  listenTokenRefresh,
  saveClient
} from '/libs/clientHelpers/persistClient'
import {
  CozyClientCreationContext,
  FetchAccessTokenResult,
  STATE_2FA_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_CONNECTED
} from '/libs/clientHelpers/types'

export const connectMagicLinkClient = async (
  client: CozyClient,
  magicCode: string
): Promise<CozyClientCreationContext> => {
  const stackClient = client.getStackClient()

  const oauthOptions = stackClient.oauthOptions
  const data = {
    magic_code: magicCode,
    client_id: oauthOptions.clientID,
    client_secret: oauthOptions.clientSecret,
    scope: '*'
  }

  const {
    two_factor_token: twoFactorToken,
    session_code: sessionCode,
    ...token
  } = await stackClient.fetchJSON<FetchAccessTokenResult>(
    'POST',
    '/auth/magic_link/flagship',
    data
  )

  const need2FA = twoFactorToken !== undefined

  if (need2FA) {
    return {
      client,
      state: STATE_2FA_NEEDED,
      twoFactorToken: twoFactorToken
    }
  }

  const needFlagshipVerification = sessionCode !== undefined

  if (needFlagshipVerification) {
    return {
      client: client,
      state: STATE_AUTHORIZE_NEEDED,
      sessionCode: sessionCode
    }
  }

  stackClient.setToken(token)

  return {
    client: client,
    state: STATE_CONNECTED
  }
}

interface Params {
  instance: string
  magicCode: string
}

export const callMagicLinkOnboardingInitClient = async ({
  instance,
  magicCode
}: Params): Promise<CozyClient> => {
  const client = await createClient(instance)
  const stackClient = client.getStackClient()

  await client.certifyFlagship()

  const oauthOptions = stackClient.oauthOptions
  const data = {
    magic_code: magicCode,
    client_id: oauthOptions.clientID,
    client_secret: oauthOptions.clientSecret,
    scope: '*'
  }

  const result = await stackClient.fetchJSON<FetchAccessTokenResult>(
    'POST',
    '/auth/magic_link/flagship',
    data
  )

  if (result.access_token) {
    stackClient.setToken(result)
  } else if (result.session_code) {
    const { session_code } = result
    const { codeVerifier, codeChallenge } = await createPKCE()

    await client.authorize({
      sessionCode: session_code,
      pkceCodes: {
        codeVerifier,
        codeChallenge
      }
    })
  }

  await client.login()
  await saveClient(client)
  listenTokenRefresh(client)

  return client
}
