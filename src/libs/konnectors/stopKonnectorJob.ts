import Minilog from 'cozy-minilog'

import CozyClient, { Q } from 'cozy-client'
import { CozyClientDocument } from 'cozy-client/types/types'

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
const stopJob = async (client: CozyClient, jobId: string): Promise<unknown> => {
  const result = (await client.query(
    Q('io.cozy.jobs').getById(jobId)
  )) as CozyClientQueryGetResult

  const job = result.data as IOCozyJob
  if (job.attributes.state === 'running')
    return client.save({
      _type: 'io.cozy.jobs',
      _id: jobId,
      _rev: job._rev,
      worker: 'client',
      attributes: {
        state: 'errored',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: TIMEOUT_KONNECTOR_ERROR
      }
    })
}

/**
 * Remove the @in trigger which will mark the given job as context deadline exceeded since this work is already done
 */
const findJobStopTriggerAndRemove = async (
  client: CozyClient,
  jobId: string
): Promise<void> => {
  const { data: triggers } = (await client.query(
    Q('io.cozy.triggers').where({
      worker: 'service',
      type: '@in',
      'message.fields.cliskJobId': jobId
    })
  )) as CozyClientQueryResult
  if (triggers.length > 0) {
    await client.destroy(triggers[0])
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    log.info(`Removed a job stop trigger : ${triggers[0]._id}`)
  }
}

interface CozyClientQueryGetResult {
  data: CozyClientDocument
}

interface CozyClientQueryResult {
  data: CozyClientDocument[]
}

interface JobDocument {
  attributes: {
    state: string
  }
}

type IOCozyJob = CozyClientDocument & JobDocument
