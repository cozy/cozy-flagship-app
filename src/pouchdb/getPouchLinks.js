import { platformReactNative } from '/pouchdb/platformReactNative'

import { StackLink } from 'cozy-client'
import { default as PouchLink } from 'cozy-pouch-link'

export const offlineDoctypes = [
  'io.cozy.accounts',
  'io.cozy.apps',
  'io.cozy.contacts',
  'io.cozy.files',
  'io.cozy.home.settings',
  'io.cozy.jobs',
  'io.cozy.konnectors',
  'io.cozy.settings',
  'io.cozy.apps.suggestions',
  'io.cozy.triggers',

  //mespapiers
  'io.cozy.bills',
  'io.cozy.sharings',
  'io.cozy.mespapiers.settings',
  'io.cozy.permissions',
]

export const getLinks = () => {
  const pouchLinkOptions = {
    doctypes: offlineDoctypes,
    initialSync: true,
    platform: platformReactNative,
    doctypesReplicationOptions: Object.fromEntries(
      offlineDoctypes.map(doctype => [
        doctype,
        {
          strategy: 'fromRemote',
          // selector: {
          //   _id: {
          //     $neq: 'io.cozy.settings.context'
          //   }
          // }
        }
      ])
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
