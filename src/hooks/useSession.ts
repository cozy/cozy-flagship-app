import { useClient, useCapabilities } from 'cozy-client'

import { useEffect, useMemo, useState } from 'react'

import { makeSessionAPI } from '/libs/functions/session'

export const useSession = () => {
  const [subdomainType, setSubdomainType] = useState()
  const client = useClient()
  const { capabilities, fetchStatus } = useCapabilities(client)

  useEffect(() => {
    fetchStatus === 'loaded' &&
      setSubdomainType(capabilities?.flat_subdomains ? 'flat' : 'nested')
  }, [capabilities, fetchStatus])

  return useMemo(
    () => makeSessionAPI(client, subdomainType),
    [client, subdomainType]
  )
}
