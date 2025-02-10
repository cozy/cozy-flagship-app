import type CozyClient from 'cozy-client'

import { finalizeClientCreation } from '/libs/clientHelpers/createClient'
import {
  CozyClientCreationContext,
  STATE_CONNECTED
} from '/libs/clientHelpers/types'
import { createPKCE } from '/app/domain/crypto/services/crypto'

interface AuthorizeClientParams {
  client: CozyClient
  sessionCode: string
}

export const authorizeClient = async ({
  client,
  sessionCode
}: AuthorizeClientParams): Promise<void> => {
  const { codeVerifier, codeChallenge } = await createPKCE()

  await client.authorize({
    sessionCode: sessionCode,
    pkceCodes: {
      codeVerifier,
      codeChallenge
    }
  })
}

export const authorizeClientAndLogin = async ({
  client,
  sessionCode
}: AuthorizeClientParams): Promise<CozyClientCreationContext> => {
  await authorizeClient({ client, sessionCode })

  await finalizeClientCreation(client)

  return {
    client: client,
    state: STATE_CONNECTED
  }
}
