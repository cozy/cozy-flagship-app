import Minilog from '@cozy/minilog'

import CozyClient from 'cozy-client'

import { TIMEOUT_KONNECTOR_ERROR } from '/libs/Launcher'

const log = Minilog('stopKonnectorJob')

export const stopKonnectorJob = async (
  client: CozyClient,
  jobId: string
): Promise<void> => {
  try {
    await client.save({
      _type: 'io.cozy.jobs',
      _id: jobId,
      _rev: true, // to force an update on Job collection
      worker: 'client',
      attributes: {
        state: 'errored',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: TIMEOUT_KONNECTOR_ERROR
      }
    })
  } catch (e) {
    log.error('Error while trying to stop job ${jobId}')
    log.error(e)
  }
}
