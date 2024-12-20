import RNRestart from 'react-native-restart'

import { platformReactNative } from '/pouchdb/platformReactNative'

import CozyClient, { CozyLink, StackLink } from 'cozy-client'
import Minilog from 'cozy-minilog'
import { default as PouchLink } from 'cozy-pouch-link'

const log = Minilog('🔗 GetLinks')

export const offlineDoctypes = [
  // cozy-home
  'io.cozy.accounts',
  'io.cozy.apps',
  'io.cozy.contacts',
  'io.cozy.files',
  'io.cozy.files.shortcuts',
  'io.cozy.home.settings',
  'io.cozy.jobs',
  'io.cozy.konnectors',
  'io.cozy.settings',
  'io.cozy.apps.suggestions',
  'io.cozy.triggers',
  'io.cozy.apps_registry',

  // mespapiers
  'io.cozy.bills',
  'io.cozy.sharings',
  'io.cozy.mespapiers.settings',
  'io.cozy.permissions'
]

export const getLinks = (): CozyLink[] => {
  const pouchLinkOptions = {
    doctypes: offlineDoctypes,
    initialSync: true,
    periodicSync: true,
    platform: platformReactNative,
    ignoreWarmup: true,
    doctypesReplicationOptions: Object.fromEntries(
      offlineDoctypes.map(doctype => {
        return [
          doctype,
          {
            strategy: 'fromRemote'
          }
        ]
      })
    )
  }

  const stackLink = new StackLink({
    platform: platformReactNative
  })

  const pouchLink = new PouchLink({
    ...pouchLinkOptions
  })

  return [stackLink, pouchLink]
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
