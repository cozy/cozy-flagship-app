import CozyClient, { QueryDefinition } from 'cozy-client'
import type { QueryResult } from 'cozy-client/types/types'
import Minilog from 'cozy-minilog'

import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('⛳🔗 flagshipLink')

export const flagshipLinkRequest = async (
  operation: QueryDefinition,
  client: CozyClient | undefined
): Promise<QueryResult> => {
  try {
    if (!client) {
      throw new Error(
        'FlagshipLinkRequest should not be called with undefined client'
      )
    }

    const result = await client.query(operation)

    return result
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something when wrong while processing FlagshipLinkRequest: ${errorMessage}`,
      operation
    )
    throw error
  }
}
