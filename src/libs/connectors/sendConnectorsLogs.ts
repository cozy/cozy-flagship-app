import Minilog from '@cozy/minilog'
import CozyClient from 'cozy-client'

import { clearLogs, spliceLogs } from '/redux/ConnectorState/ConnectorLogsSlice'
import { store } from '/store'

const log = Minilog('sendConnectorsLogs')

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const sendConnectorsLogs = async (
  client: CozyClient,
  limit?: number
): Promise<void> => {
  try {
    const state = store.getState()
    log.debug(
      `🐙 Current number of logs to handle: `,
      state.connectorLogs.logs.length
    )

    const logs = limit
      ? state.connectorLogs.logs.slice(0, limit)
      : state.connectorLogs.logs

    log.debug(`🐟 logs`, logs)

    store.dispatch(limit ? spliceLogs(limit) : clearLogs())
    const state2 = store.getState()

    await sleep(500)
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    log.debug(`🐙 ${client.getStackClient().uri}`)

    log.debug(
      `🐙 New number of logs to handle: `,
      state2.connectorLogs.logs.length
    )
  } catch (e) {
    log.error(e)
  }
}
