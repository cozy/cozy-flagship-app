import type CozyClient from 'cozy-client'

import {
  is2FAReason,
  isFetchError,
  LoginFlagshipResult
} from '/libs/clientHelpers/types'
import type {
  LoginData,
  TwoFactorAuthenticationData
} from '/screens/login/components/types'

interface LoginFlagshipParams {
  client: CozyClient
  loginData: LoginData
  twoFactorAuthenticationData?: TwoFactorAuthenticationData
  emailVerifiedCode?: string
}

/**
 * Try to login cozy-client using Flagship dedicated route
 *
 * Errors are handled to detect when 2FA is needed and when password is invalid
 *
 * @param {object} param
 * @param {object} param.client - the CozyClient instance that will be authenticated through OAuth
 * @param {object} param.loginData - login data containing hashed password
 * @param {object} [param.twoFactorAuthenticationData] - the 2FA data containing a token and a passcode
 * @param {string} [param.emailVerifiedCode] - the emailVerifiedCode that should be used to log in the stack
 * @returns {LoginFlagshipResult} The query result with session_code, or 2FA token, or invalid password error
 * @throws
 */
export const loginFlagship = async ({
  client,
  loginData,
  twoFactorAuthenticationData = undefined,
  emailVerifiedCode
}: LoginFlagshipParams): Promise<LoginFlagshipResult> => {
  const stackClient = client.getStackClient()
  try {
    const loginResult = await stackClient.loginFlagship({
      passwordHash: loginData.passwordHash,
      twoFactorToken: twoFactorAuthenticationData
        ? twoFactorAuthenticationData.token
        : undefined,
      twoFactorPasscode: twoFactorAuthenticationData
        ? twoFactorAuthenticationData.passcode
        : undefined,
      ...(emailVerifiedCode ? { emailVerifiedCode } : {})
    })

    return loginResult
  } catch (e: unknown) {
    if (!isFetchError(e)) {
      throw e
    }

    if (e.status === 401) {
      if (is2FAReason(e.reason) && e.reason.two_factor_token) {
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
