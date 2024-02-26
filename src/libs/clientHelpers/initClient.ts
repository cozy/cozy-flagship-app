import CozyClient from 'cozy-client'

import { authorizeClient } from '/libs/clientHelpers/authorizeClient'
import { connectClient } from '/libs/clientHelpers/connectClient'
import {
  createClient,
  finalizeClientCreation
} from '/libs/clientHelpers/createClient'
import {
  CozyClientCreationContext,
  isAccessToken,
  isFlagshipVerificationNeededResult
} from '/libs/clientHelpers/types'
import { LoginData } from '/screens/login/components/types'

interface CallInitClientParams {
  client?: CozyClient
  instance: string
  loginData: LoginData
  emailVerifiedCode?: string
}

/**
 * Create the OAuth connection for the given Cozy instance
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {string} param.instance - the Cozy instance used to create the client
 * @param {CozyClient} [param.client] - an optional CozyClient instance that can be used for the authentication. If not provided a new CozyClient will be created
 * @param {string} [param.emailVerifiedCode] - the emailVerifiedCode that should be used to log in the stack
 * @returns {CozyClientCreationContext} The CozyClient for the Cozy instance with its corresponding state (i.e: connected, waiting for 2FA, invalid password etc)
 */
export const callInitClient = async ({
  loginData,
  instance,
  client: clientParam,
  emailVerifiedCode
}: CallInitClientParams): Promise<CozyClientCreationContext> => {
  const client = clientParam ?? (await createClient(instance))

  return await connectClient({
    loginData,
    client,
    emailVerifiedCode
  })
}

interface CallOnboardingInitClientParams {
  instance: string
  loginData: LoginData
  registerToken: string
}

/**
 * Onboard the Cozy instance by specifying its password and encryption keys
 *
 * @param {object} param
 * @param {LoginData} param.loginData - login data containing hashed password and encryption keys
 * @param {string} param.instance - the Cozy instance used to create the client
 * @param {string} param.registerToken - the registerToken from the onboarding link that should be used to log in the stack
 * @returns {CozyClient} The created and authenticated CozyClient for the newly onboarded Cozy instance
 */
export const callOnboardingInitClient = async ({
  loginData,
  instance,
  registerToken
}: CallOnboardingInitClientParams): Promise<CozyClient> => {
  const client = await createClient(instance)
  const stackClient = client.getStackClient()

  await client.certifyFlagship()

  const { passwordHash, hint, iterations, key, publicKey, privateKey } =
    loginData

  const result = await stackClient.setPassphraseFlagship({
    registerToken,
    passwordHash,
    hint,
    iterations,
    key,
    publicKey,
    privateKey
  })

  if (isAccessToken(result)) {
    stackClient.setToken(result)
  } else if (isFlagshipVerificationNeededResult(result)) {
    await authorizeClient({ client, sessionCode: result.session_code })
  }

  await finalizeClientCreation(client)

  return client
}
