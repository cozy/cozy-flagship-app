import type CozyClient from 'cozy-client'
import type { LoginFlagshipResult } from 'cozy-client'

import {
  CozyClientCreationContext,
  is2faNeededResult,
  isFlagshipVerificationNeededResult,
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

  const result = await stackClient.fetchJSON<LoginFlagshipResult>(
    'POST',
    '/oidc/access_token',
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
