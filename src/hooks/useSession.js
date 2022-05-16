import { useClient, useQuery, Q, isQueryLoading } from 'cozy-client'
import { useEffect, useMemo, useState } from 'react'

import { makeSessionAPI } from '/libs/functions/session'
import { useSplashScreen } from '/hooks/useSplashScreen'

export const useSession = () => {
  const [subdomainType, setSubdomainType] = useState()
  const { hideSplashScreen } = useSplashScreen()
  const client = useClient()
  const { data, ...query } = useQuery(
    Q('io.cozy.settings').getById('capabilities'),
    { as: 'io.cozy.settings/capabilities', singleDocData: true }
  )

  useEffect(() => {
    !isQueryLoading(query) &&
      setSubdomainType(
        data && data.attributes && data.attributes.flat_subdomains
          ? 'flat'
          : 'nested'
      )
  }, [data, hideSplashScreen, query])

  return useMemo(
    () => makeSessionAPI(client, subdomainType),
    [client, subdomainType]
  )
}
