import type CozyClient from 'cozy-client'
import type { LoginFlagshipResult } from 'cozy-client'

import { authorizeClient } from '/libs/clientHelpers/authorizeClient'
import { createClient } from '/libs/clientHelpers/createClient'
import {
  listenTokenRefresh,
  saveClient
} from '/libs/clientHelpers/persistClient'
import {
  CozyClientCreationContext,
  is2faNeededResult,
  isAccessToken,
  isFlagshipVerificationNeededResult,
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

  const result = await stackClient.fetchJSON<LoginFlagshipResult>(
    'POST',
    '/auth/magic_link/flagship',
    data
  )

  if (is2faNeededResult(result)) {
    return {
      client,
      state: STATE_2FA_NEEDED,
      twoFactorToken: result.two_factor_token
    }
  }

  if (isFlagshipVerificationNeededResult(result)) {
    return {
      client: client,
      state: STATE_AUTHORIZE_NEEDED,
      sessionCode: result.session_code
    }
  }

  stackClient.setToken(result)

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

  const result = await stackClient.fetchJSON<LoginFlagshipResult>(
    'POST',
    '/auth/magic_link/flagship',
    data
  )

  if (isAccessToken(result)) {
    stackClient.setToken(result)
  } else if (isFlagshipVerificationNeededResult(result)) {
    await authorizeClient({ client, sessionCode: result.session_code })
  }

  await client.login()
  await saveClient(client)
  listenTokenRefresh(client)

  return client
}
