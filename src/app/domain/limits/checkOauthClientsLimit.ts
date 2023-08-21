import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('⛔ Check OAuth Clients Limit')

interface ClientsUsageResult {
  data?: {
    attributes?: {
      count: number
      limit: number
    }
  }
}

export const checkOauthClientsLimit = async (
  client: CozyClient
): Promise<boolean> => {
  try {
    const stackClient = client.getStackClient()
    const result = await stackClient.fetchJSON<ClientsUsageResult>(
      'GET',
      `/settings/clients-usage`
    )

    const count = result.data?.attributes?.count ?? 0
    const limit = result.data?.attributes?.limit ?? 1

    return count > limit
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(`Error while fetching OAuth clients limit: ${errorMessage}`)

    return false
  }
}
