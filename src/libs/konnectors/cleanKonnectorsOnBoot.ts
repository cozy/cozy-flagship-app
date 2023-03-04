import Minilog from '@cozy/minilog'

import CozyClient from 'cozy-client'

import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { sendKonnectorsLogs } from '/libs/konnectors/sendKonnectorsLogs'
import {
  CurrentKonnectorState,
  setCurrentRunningKonnector
} from '/redux/KonnectorState/CurrentKonnectorSlice'
import { store } from '/redux/store'

const log = Minilog('cleanKonnectorsOnBoot')

const CLEAN_DELAY_IN_MS = 3000

const getRunningKonnector = (state: {
  currentKonnector: CurrentKonnectorState
}): string | undefined => {
  return state.currentKonnector.currentRunningKonnector
}

/**
 * Check for still-running konnectors, clean them and
 * send remaining konnectors' logs on cozy-stack
 */
export const cleanKonnectorsOnBoot = async (
  client: CozyClient
): Promise<void> => {
  const state = store.getState()

  const runningKonnector = getRunningKonnector(state)
  if (runningKonnector !== undefined) {
    log.error(
      `A running konnector is tagged as running. This means that the app may have previously crashed. Related konnector: ${runningKonnector}`
    )

    store.dispatch(setCurrentRunningKonnector())
  }

  await sendKonnectorsLogs(client)
}

/**
 * After the specified delay, check for still-running konnectors, clean them and
 * send remaining konnectors' logs on cozy-stack
 *
 * This method runs in background and should not be awaited
 */
export const cleanKonnectorsOnBootInBackground = (
  client: CozyClient,
  delayInMs = CLEAN_DELAY_IN_MS
): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      cleanKonnectorsOnBoot(client)
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
