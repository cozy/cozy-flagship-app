import Minilog from '@cozy/minilog'

import CozyClient, { Q } from 'cozy-client'

import { TIMEOUT_KONNECTOR_ERROR } from '/libs/Launcher'

const log = Minilog('stopKonnectorJob')

export const stopKonnectorJob = async (
  client: CozyClient,
  jobId: string
): Promise<void> => {
  try {
    await stopJob(client, jobId)
    await findJobStopTriggerAndRemove(client, jobId)
  } catch (e) {
    log.error('Error while trying to stop job ${jobId}')
    log.error(e)
  }
}

/**
 * Mark the given job as "context deadline exceeded"
 */
const stopJob = (client: CozyClient, jobId: string): Promise<unknown> => {
  return client.save({
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
}

/**
 * Remove the @at trigger which will mark the given job as context deadline exceeded since this work is already done
 */
const findJobStopTriggerAndRemove = async (
  client: CozyClient,
  jobId: string
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: triggers } = await client.query(
    Q('io.cozy.triggers').where({
      worker: 'service',
      type: '@at',
      'message.fields.cliskJobId': jobId
    })
  )
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (triggers.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    await client.destroy(triggers[0])
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    log.info(`Removed a job stop trigger : ${triggers[0]._id}`)
  }
}
