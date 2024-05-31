import { platformReactNative } from '/pouchdb/platformReactNative'

import { default as PouchLink } from 'cozy-pouch-link'

export const offlineDoctypes = [
  'io.cozy.accounts',
  'io.cozy.apps',
  'io.cozy.contacts',
  'io.cozy.files',
  'io.cozy.jobs',
  'io.cozy.konnectors',
  'io.cozy.settings',
  'io.cozy.triggers'
]

export const getLinks = () => {
  const pouchLinkOptions = {
    doctypes: offlineDoctypes,
    initialSync: true,
    platform: platformReactNative
  }

  const pouchLink = new PouchLink({
    ...pouchLinkOptions
  })

  return [pouchLink]
}
