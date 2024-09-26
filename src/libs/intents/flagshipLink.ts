import { uniqueId } from 'lodash'

import CozyClient, { QueryDefinition } from 'cozy-client'
import type { QueryResult } from 'cozy-client/types/types'
import Minilog from 'cozy-minilog'

import rnperformance from '/app/domain/performances/measure'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('⛳🔗 flagshipLink')

export const flagshipLinkRequest = async (
  operation: QueryDefinition,
  client: CozyClient | undefined
): Promise<QueryResult> => {
  const markName = rnperformance.mark(
    `FlagshipLinkRequest ${operation.doctype} ${uniqueId()}`
  )
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
      rnperformance.measure({
        markName: markName,
        measureName: `${markName} skip jobs`,
        category: 'FlagshipLinkRequest'
      })
      return {
        data: [],
        meta: {
          count: 0
        },
        next: false,
        skip: 0
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await client.query(operation)
    rnperformance.measure({
      markName: markName,
      measureName: `${markName} success`,
      category: 'FlagshipLinkRequest'
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something when wrong while processing FlagshipLinkRequest: ${errorMessage}`,
      operation
    )
    rnperformance.measure({
      markName: markName,
      measureName: `${markName} error`,
      category: 'FlagshipLinkRequest',
      color: 'error'
    })
    throw error
  }
}
