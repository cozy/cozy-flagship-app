import CozyClient from 'cozy-client'
import Minilog from 'cozy-minilog'
import PouchLink from 'cozy-pouch-link'

const log = Minilog('📶 Offline utils')

export const triggerPouchReplication = (client?: CozyClient): void => {
  log.debug('Trigger PouchReplication (debounce)')
  const pouchLink = getPouchLink(client)
  pouchLink?.startReplicationWithDebounce()
}

export const getPouchLink = (client?: CozyClient): PouchLink | null => {
  if (!client) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return client.links.find(link => link instanceof PouchLink) || null
}
