import { useEffect } from 'react'

import { useClient } from 'cozy-client'
import type { CozyClientDocument } from 'cozy-client/types/types'
import Minilog from 'cozy-minilog'

import { triggerPouchReplication } from '/app/domain/offline/utils'
import { offlineDoctypes } from '/pouchdb/getLinks'

const log = Minilog('📶 useOfflineReplicationOnRealtime')

export const useOfflineReplicationOnRealtime = (): void => {
  const client = useClient()

  useEffect(() => {
    if (!client) return

    // @ts-expect-error client.plugins is not typed
    const realtime = client.plugins.realtime as CozyRealtime

    const triggerReplication =
      (verb: string) =>
      (doc: CozyClientDocument): void => {
        const docInfo = `${verb} ${doc._type ?? ''} ${doc._id ?? ''}`
        log.debug(`Trigger replication from realtime event (${docInfo})`)
        triggerPouchReplication(client)
      }

    const triggerReplicationCreated = triggerReplication('created')
    const triggerReplicationUpdated = triggerReplication('updated')
    const triggerReplicationDeleted = triggerReplication('deleted')

    offlineDoctypes.forEach(doctype => {
      realtime.subscribe('created', doctype, triggerReplicationCreated)
      realtime.subscribe('updated', doctype, triggerReplicationUpdated)
      realtime.subscribe('deleted', doctype, triggerReplicationDeleted)
    })

    return () => {
      offlineDoctypes.forEach(doctype => {
        realtime.unsubscribe('created', doctype, triggerReplicationCreated)
        realtime.unsubscribe('updated', doctype, triggerReplicationUpdated)
        realtime.unsubscribe('deleted', doctype, triggerReplicationDeleted)
      })
    }
  })
}

interface CozyRealtime {
  subscribe: (event: string, type: string, handler: Subscription) => void
  unsubscribe: (event: string, type: string, handler: Subscription) => void
}

type Subscription = (doc: CozyClientDocument) => void
