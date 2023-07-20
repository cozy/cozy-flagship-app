import type CozyClient from 'cozy-client'

import { authorizeClient } from '/libs/clientHelpers/authorizeClient'
import {
  createClient,
  finalizeClientCreation
} from '/libs/clientHelpers/createClient'
import {
  CozyClientCreationContext,
  is2faNeededResult,
  is2faPasswordNeededResult,
  isAccessToken,
  isFetchError,
  isFlagshipVerificationNeededResult,
  isInvalidPasswordResult,
  LoginFlagshipResult,
  STATE_2FA_PASSWORD_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_CONNECTED,
  STATE_INVALID_PASSWORD
} from '/libs/clientHelpers/types'
import { t } from '/locales/i18n'

const ERROR_2FA_PASSWORD_NEEDED =
  'passphrase is required as second authentication factor'

const ERROR_INVALID_MAGIC_CODE = 'invalid magic code'

const loginMagicLink = async (
  client: CozyClient,
  magicCode: string,
  passwordHash?: string
): Promise<LoginFlagshipResult> => {
  const stackClient = client.getStackClient()

  try {
    const oauthOptions = stackClient.oauthOptions
    const data = {
      magic_code: magicCode,
      passphrase: passwordHash,
      client_id: oauthOptions.clientID,
      client_secret: oauthOptions.clientSecret
    }

    const loginResult = await stackClient.fetchJSON<LoginFlagshipResult>(
      'POST',
      '/auth/magic_link/flagship',
      data
    )

    return loginResult
  } catch (e: unknown) {
    if (!isFetchError(e)) {
      throw e
    }

    if (e.status === 401) {
      if (e.reason?.error === ERROR_2FA_PASSWORD_NEEDED) {
        return {
          twoFactorPasswordNeeded: true
        }
      } else if (e.reason?.error === ERROR_INVALID_MAGIC_CODE) {
        throw new Error(t('screens.login.invalidMagicCode'), e)
      } else {
        throw new Error('Error while calling loginMagicLink', e)
      }
    } else {
      throw e
    }
  }
}

export const connectMagicLinkClient = async (
  client: CozyClient,
  magicCode: string,
  passwordHash?: string
): Promise<CozyClientCreationContext> => {
  const stackClient = client.getStackClient()

  const result = await loginMagicLink(client, magicCode, passwordHash)

  if (isInvalidPasswordResult(result)) {
    return {
      client,
      state: STATE_INVALID_PASSWORD
    }
  }

  if (is2faNeededResult(result)) {
    throw new Error('Magic login should never return is2faNeededResult result')
  }

  if (is2faPasswordNeededResult(result)) {
    return {
      client,
      state: STATE_2FA_PASSWORD_NEEDED
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
  await finalizeClientCreation(client)

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
    client_secret: oauthOptions.clientSecret
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

  await finalizeClientCreation(client)

  return client
}
