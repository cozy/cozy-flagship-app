import { useEffect } from 'react'

import { useClient } from 'cozy-client'

import { synchronizeOnInit } from '/app/domain/authentication/services/SynchronizeService'
import { safePromise } from '/utils/safePromise'

export const useSynchronizeOnInit = (): void => {
  const client = useClient()

  useEffect(() => {
    if (client) safePromise(synchronizeOnInit)(client)
  }, [client])
}
