import Minilog from 'cozy-minilog'

import CozyClient from 'cozy-client'

import {
  LogObjWithoutSlug,
  removeLogs
} from '/redux/KonnectorState/KonnectorLogsSlice'
import { store } from '/redux/store'

const log = Minilog('sendKonnectorsLogs')

export const sendKonnectorsLogs = async (client: CozyClient): Promise<void> => {
  try {
    const state = store.getState()
    const logs = state.konnectorLogs.logs

    // You can activate this line to get the log loop data
    // log.debug(`🐟 ${this.loopId} - logs`, logs)

    const slugs = Object.keys(logs)
    for (const slug of slugs) {
      log.debug(
        `🐟 Sending ${slug} logs batch : ${logs[slug]?.length ?? 0} items`
      )
      // Clean slug property in LogObj

      // Locally disable the rule because we delete the slug property with a destructuring assignment
      /* eslint "@typescript-eslint/no-unused-vars" : ["warn", { "ignoreRestSiblings": true }] */
      const cleanedLogs = logs[slug]?.map(({ slug, ...el }) => el)
      if (!cleanedLogs) {
        continue
      }
      // Construct object by jobId keys, possibly undefined
      const cleanedLogsById = sortLogsById(cleanedLogs)
      for (const id of Object.keys(cleanedLogsById)) {
        const jobId = id === 'undefinedId' ? undefined : id
        try {
          // Sending
          await client
            .getStackClient()
            .fetchJSON(
              'POST',
              `/konnectors/${slug}/logs?job_id=${jobId ?? ''}`,
              cleanedLogsById[id]
            )
          // Deleting
          store.dispatch(removeLogs({ slug, number: cleanedLogs.length }))
        } catch (e) {
          log.error(`Error while sending ${slug} logs`)
          log.error(e)
        }
      }
    }
  } catch (e) {
    log.error('Error in loop while sending konnectors logs to stack')
    log.error(e)
  }
}

export const sortLogsById = (
  cleanedLogs: LogObjWithoutSlug[]
): Record<string, LogObjWithoutSlug[] | undefined> => {
  const cleanedLogsById: Record<string, LogObjWithoutSlug[] | undefined> = {}
  for (const logLine of cleanedLogs) {
    if (logLine.jobId) {
      if (cleanedLogsById[logLine.jobId]) {
        cleanedLogsById[logLine.jobId]?.push(logLine)
      } else {
        cleanedLogsById[logLine.jobId] = [logLine]
      }
    } else {
      if (cleanedLogsById.undefinedId) {
        cleanedLogsById.undefinedId.push(logLine)
      } else {
        cleanedLogsById.undefinedId = [logLine]
      }
    }
  }
  return cleanedLogsById
}
