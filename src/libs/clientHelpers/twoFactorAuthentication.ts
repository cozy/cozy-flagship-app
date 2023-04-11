import CozyClient from 'cozy-client'

import { connectClient } from '/libs/clientHelpers/connectClient'
import { CozyClientCreationContext } from '/libs/clientHelpers/types'
import {
  LoginData,
  TwoFactorAuthenticationData
} from '/screens/login/components/types'

interface Call2FAInitClientParams {
  client: CozyClient
  loginData: LoginData
  twoFactorAuthenticationData: TwoFactorAuthenticationData
}

/**
 * Continue the OAuth connection for the given Cozy instance when `callInitClient` has been called but returned a 2FA_NEEDED state
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {CozyClient} param.client - an optional CozyClient instance that can be used for the authentication. If not provided a new CozyClient will be created
 * @returns {CozyClientCreationContext} The CozyClient for the Cozy instance with its corresponding state (i.e: connected, waiting for 2FA, invalid password etc)
 */
export const call2FAInitClient = async ({
  loginData,
  client,
  twoFactorAuthenticationData
}: Call2FAInitClientParams): Promise<CozyClientCreationContext> => {
  return await connectClient({
    loginData,
    client,
    twoFactorAuthenticationData
  })
}
