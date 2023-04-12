import type CozyClient from 'cozy-client'

import { loginFlagship } from '/libs/clientHelpers/loginFlagship'
import {
  listenTokenRefresh,
  saveClient
} from '/libs/clientHelpers/persistClient'
import {
  CozyClientCreationContext,
  is2faNeededResult,
  is2faPasswordNeededResult,
  isFlagshipVerificationNeededResult,
  isInvalidPasswordResult,
  STATE_2FA_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_CONNECTED,
  STATE_INVALID_PASSWORD
} from '/libs/clientHelpers/types'
import type {
  LoginData,
  TwoFactorAuthenticationData
} from '/screens/login/components/types'

interface ConnectClientParams {
  loginData: LoginData
  client: CozyClient
  twoFactorAuthenticationData?: TwoFactorAuthenticationData
}

/**
 * Process the OAuth dance for the given CozyClient
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {CozyClient} param.client - the CozyClient instance that will be authenticated through OAuth
 * @param {TwoFactorAuthenticationData} param.twoFactorAuthenticationData - the 2FA data containing a token and a passcode
 * @returns {CozyClientCreationContext} The CozyClient with its corresponding state (i.e: connected, waiting for 2FA, invalid password etc)
 */
export const connectClient = async ({
  loginData,
  client,
  twoFactorAuthenticationData = undefined
}: ConnectClientParams): Promise<CozyClientCreationContext> => {
  const result = await loginFlagship({
    client,
    loginData,
    twoFactorAuthenticationData
  })

  if (isInvalidPasswordResult(result)) {
    return {
      client,
      state: STATE_INVALID_PASSWORD
    }
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
      'Login should never return is2faPasswordNeededResult result (reserved for MagicLink scenario)'
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

  await client.login()
  await saveClient(client)
  listenTokenRefresh(client)

  return {
    client: client,
    state: STATE_CONNECTED
  }
}
