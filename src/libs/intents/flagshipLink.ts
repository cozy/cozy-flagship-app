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

    // Temporary skip `io.cozy.jobs` queries as they are not mandatory
    // to display cozy-home but are very long to be executed (>20s) and
    // delay cozy-home first draw
    // Should be removed when we find an optimisation for `io.cozy.jobs`
    if (operation.doctype === 'io.cozy.jobs') {
      return {
        data: [],
        meta: {
          count: 0
        },
        next: false,
        skip: 0
      }
    }

    const start = new Date()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await client.query(operation)

    const end = new Date()
    const duration = end.getTime() - start.getTime()
    log.debug(`⏰ operation took ${duration}ms -- ${JSON.stringify(operation)}`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
