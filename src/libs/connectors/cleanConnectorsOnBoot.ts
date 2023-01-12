import Minilog from '@cozy/minilog'
import CozyClient from 'cozy-client'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { sendConnectorsLogs } from '/libs/connectors/sendConnectorsLogs'
import { CurrentConnectorState } from '/redux/ConnectorState/CurrentConnectorSlice'
import { store } from '/redux/store'

const log = Minilog('cleanConnectorsOnBoot')

const CLEAN_DELAY_IN_MS = 3000

const getRunningConnector = (state: {
  currentConnector: CurrentConnectorState
}): string | undefined => {
  return state.currentConnector.currentRunningConnector
}

/**
 * Check for still-running connectors, clean them and
 * send remaining connectors' logs on cozy-stack
 */
export const cleanConnectorsOnBoot = async (
  client: CozyClient
): Promise<void> => {
  const state = store.getState()

  const runningConnector = getRunningConnector(state)
  if (runningConnector !== undefined) {
    log.error(
      `A running connector is tagged as running. This means that the app may have previously crashed. Related connector: ${runningConnector}`
    )
  }

  await sendConnectorsLogs(client, 4)
}

/**
 * After the specified delay, check for still-running connectors, clean them and
 * send remaining connectors' logs on cozy-stack
 *
 * This method runs in background and should not be awaited
 */
export const cleanConnectorsOnBootInBackground = (
  client: CozyClient,
  delayInMs = CLEAN_DELAY_IN_MS
): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      cleanConnectorsOnBoot(client)
        .then(resolve)
        .catch(err =>
          log.error(
            `Something went wront while sending logs: ${getErrorMessage(err)}`,
            resolve()
          )
        )
    }, delayInMs)
  })
}
