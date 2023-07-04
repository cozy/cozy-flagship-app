import type CozyClient from 'cozy-client'

import { finalizeClientCreation } from '/libs/clientHelpers/createClient'
import {
  CozyClientCreationContext,
  is2faNeededResult,
  is2faPasswordNeededResult,
  isFetchError,
  isFlagshipVerificationNeededResult,
  isInvalidPasswordResult,
  LoginFlagshipResult,
  STATE_2FA_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_CONNECTED
} from '/libs/clientHelpers/types'
import { TwoFactorAuthenticationData } from '/screens/login/components/types'

const loginOidc = async (
  client: CozyClient,
  oidcCode: string,
  twoFactorAuthenticationData?: TwoFactorAuthenticationData
): Promise<LoginFlagshipResult> => {
  const stackClient = client.getStackClient()

  try {
    const oauthOptions = stackClient.oauthOptions
    const data = {
      code: oidcCode,
      client_id: oauthOptions.clientID,
      client_secret: oauthOptions.clientSecret,
      scope: '*',
      two_factor_token: twoFactorAuthenticationData
        ? twoFactorAuthenticationData.token
        : undefined,
      two_factor_passcode: twoFactorAuthenticationData
        ? twoFactorAuthenticationData.passcode
        : undefined
    }

    const loginResult = await stackClient.fetchJSON<LoginFlagshipResult>(
      'POST',
      '/oidc/access_token',
      data
    )

    return loginResult
  } catch (e: unknown) {
    if (!isFetchError(e)) {
      throw e
    }

    if (e.status === 401) {
      if (e.reason?.two_factor_token) {
        return {
          two_factor_token: e.reason.two_factor_token
        }
      } else {
        return {
          invalidPassword: true
        }
      }
    } else if (e.status === 403 && twoFactorAuthenticationData) {
      return {
        two_factor_token: twoFactorAuthenticationData.token
      }
    } else {
      throw e
    }
  }
}

export const connectOidcClient = async (
  client: CozyClient,
  oidcCode: string,
  twoFactorAuthenticationData?: TwoFactorAuthenticationData
): Promise<CozyClientCreationContext> => {
  const result = await loginOidc(client, oidcCode, twoFactorAuthenticationData)

  if (isInvalidPasswordResult(result)) {
    throw new Error(
      'Oidc login should never return isInvalidPasswordResult result'
    )
  }

  if (is2faNeededResult(result)) {
    return {
      client,
      state: STATE_2FA_NEEDED,
      twoFactorToken: result.two_factor_token
    }
  }

  if (is2faPasswordNeededResult(result)) {
    throw new Error(
      'Oidc login should never return is2faPasswordNeededResult result'
    )
  }

  if (isFlagshipVerificationNeededResult(result)) {
    return {
      client: client,
      state: STATE_AUTHORIZE_NEEDED,
      sessionCode: result.session_code
    }
  }

  const stackClient = client.getStackClient()
  stackClient.setToken(result)

  await finalizeClientCreation(client)

  return {
    client: client,
    state: STATE_CONNECTED
  }
}
