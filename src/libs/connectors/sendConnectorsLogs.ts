import Minilog from '@cozy/minilog'
import CozyClient from 'cozy-client'

import { removeLogs } from '/redux/ConnectorState/ConnectorLogsSlice'
import { store } from '/redux/store'

const log = Minilog('sendConnectorsLogs')

export const sendConnectorsLogs = async (client: CozyClient): Promise<void> => {
  try {
    const state = store.getState()
    const logs = state.connectorLogs.logs

    // You can activate this line to get the log loop data
    // log.debug(`🐟 ${this.loopId} - logs`, logs)

    const slugs = Object.keys(logs)
    for (const slug of slugs) {
      log.debug(`Sending ${slug} logs batch`)
      // Clean slug property in LogObj
      const cleanedLogs = logs[slug]?.map(({ slug, ...el }) => el)
      if (!cleanedLogs) {
        continue
      }
      try {
        // Sending
        await client
          .getStackClient()
          .fetchJSON('POST', `/konnectors/${slug}/logs`, cleanedLogs)
        // Deleting
        store.dispatch(removeLogs({ slug, number: cleanedLogs.length }))
      } catch (e) {
        log.error(`Error while sending ${slug} logs`)
        log.error(e)
      }
    }
  } catch (e) {
    log.error('Error in loop while sending konnectors logs to stack')
    log.error(e)
  }
}
