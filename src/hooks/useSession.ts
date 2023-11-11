import { useEffect, useMemo, useState } from 'react'

import { useClient, useCapabilities } from 'cozy-client'

import { makeSessionAPI, SessionApi } from '/libs/functions/session'

export const useSession = (): SessionApi => {
  const [subdomainType, setSubdomainType] = useState<string>()
  const client = useClient()
  const { capabilities, fetchStatus } = useCapabilities(client)

  useEffect(() => {
    fetchStatus === 'loaded' &&
      // @ts-expect-error : cozy-client has to be updated
      setSubdomainType(capabilities?.flat_subdomains ? 'flat' : 'nested')
  }, [capabilities, fetchStatus])

  return useMemo(
    // We have to assume that client and subdomainType are defined
    // Still, this is old code and we should probably refactor it
    // Adding a @TODO flag for now
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => makeSessionAPI(client!, subdomainType!),
    [client, subdomainType]
  )
}
