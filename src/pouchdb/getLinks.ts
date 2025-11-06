import RNRestart from 'react-native-restart'

import {
  // PouchLinkPerformanceApi,
  StackLinkPerformanceApi
} from '/app/domain/performances/measure'
import { platformReactNative } from '/pouchdb/platformReactNative'

import CozyClient, { CozyLink, StackLink } from 'cozy-client'
import Minilog from 'cozy-minilog'
// import { default as PouchLink } from 'cozy-pouch-link'
// import { PouchLinkOptions } from 'cozy-pouch-link/types/CozyPouchLink'

const log = Minilog('🔗 GetLinks')

export const REPLICATION_DEBOUNCE = 60 * 1000 // 60 seconds
export const REPLICATION_DEBOUNCE_MAX_DELAY = 5 * 60 * 1000 // 5 min

// The io.cozy.jobs are intentionnaly skipped from this list
export const offlineDoctypes = [
  'io.cozy.permissions',
  'io.cozy.bills',
  'io.cozy.sharings',
  'io.cozy.accounts',
  'io.cozy.apps',
  'io.cozy.contacts',
  'io.cozy.files',
  'io.cozy.files.shortcuts',
  'io.cozy.konnectors',
  'io.cozy.settings',
  'io.cozy.apps.suggestions',
  'io.cozy.triggers',
  'io.cozy.apps_registry',
  'io.cozy.calendar.events',
  'io.cozy.calendar.todos',
  'io.cozy.calendar.presence',
  'io.cozy.timeseries.grades',
  'io.cozy.identities',

  // app specific
  'io.cozy.mespapiers.settings',
  'io.cozy.files.settings',
  'io.cozy.home.settings'
]

export const getLinks = (): CozyLink[] => {
  // const pouchLinkOptions = {
  //   doctypes: offlineDoctypes,
  //   initialSync: false,
  //   periodicSync: false,
  //   syncDebounceDelayInMs: REPLICATION_DEBOUNCE,
  //   syncDebounceMaxDelayInMs: REPLICATION_DEBOUNCE_MAX_DELAY,
  //   platform: platformReactNative,
  //   ignoreWarmup: true,
  //   doctypesReplicationOptions: Object.fromEntries(
  //     offlineDoctypes.map(doctype => {
  //       return [
  //         doctype,
  //         {
  //           strategy: 'fromRemote'
  //         }
  //       ]
  //     })
  //   ),
  //   performanceApi: PouchLinkPerformanceApi,
  //   pouch: {
  //     options: {
  //       adapter: 'react-native-sqlite'
  //     }
  //   }
  // } as unknown as PouchLinkOptions

  const stackLink = new StackLink({
    platform: platformReactNative,
    performanceApi: StackLinkPerformanceApi
  })

  // const pouchLink = new PouchLink({
  //   ...pouchLinkOptions
  // })

  return [stackLink]
}

export const resetLinksAndRestart = async (
  client?: CozyClient
): Promise<void> => {
  if (!client) {
    log.info('ResetLinksAndRestart called with no client, return')
    return
  }

  for (const link of client.links) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await link.reset()
  }

  RNRestart.Restart()
}
