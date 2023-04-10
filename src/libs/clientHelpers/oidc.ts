import type CozyClient from 'cozy-client'

import {
  CozyClientCreationContext,
  FetchAccessTokenResult,
  STATE_2FA_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_CONNECTED
} from '/libs/clientHelpers/types'

export const connectOidcClient = async (
  client: CozyClient,
  oidcCode: string
): Promise<CozyClientCreationContext> => {
  const stackClient = client.getStackClient()

  const oauthOptions = stackClient.oauthOptions
  const data = {
    code: oidcCode,
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
    '/oidc/access_token',
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
