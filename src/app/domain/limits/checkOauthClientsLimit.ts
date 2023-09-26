import CozyClient from 'cozy-client'
import flag from 'cozy-flags'
import Minilog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('⛔ Check OAuth Clients Limit')

interface ClientUsage {
  count: number
  limit: number
  limitReached: boolean
  limitExceeded: boolean
}

interface ClientsUsageResult {
  data?: {
    attributes?: ClientUsage
  }
}

export const checkOauthClientsLimit = async (
  client: CozyClient
): Promise<boolean> => {
  try {
    if (!flag('cozy.oauthclients.max')) {
      log.debug('No Oauth limit in flags, skip verification')
      return false
    }

    const stackClient = client.getStackClient()
    const result = await stackClient.fetchJSON<ClientsUsageResult>(
      'GET',
      `/settings/clients-usage`
    )

    return result.data?.attributes?.limitExceeded ?? false
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(`Error while fetching OAuth clients limit: ${errorMessage}`)

    return false
  }
}
