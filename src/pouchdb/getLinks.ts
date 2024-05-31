import { platformReactNative } from '/pouchdb/platformReactNative'

import { CozyLink, StackLink } from 'cozy-client'
import { default as PouchLink } from 'cozy-pouch-link'

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
    platform: platformReactNative
  }

  const stackLink = new StackLink({
    platform: platformReactNative
  })

  const pouchLink = new PouchLink({
    ...pouchLinkOptions
  })

  return [stackLink, pouchLink]
}
