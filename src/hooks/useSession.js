import {useClient, useQuery, Q, isQueryLoading} from 'cozy-client'
import {useEffect, useMemo, useState} from 'react'

import {makeSessionAPI} from '../libs/functions/session'

export const useSession = () => {
  const [subdomainType, setSubdomainType] = useState()
  const client = useClient()
  const {data, ...query} = useQuery(
    Q('io.cozy.settings').getById('capabilities'),
    {as: 'io.cozy.settings/capabilities', singleDocData: true},
  )

  useEffect(() => {
    !isQueryLoading(query) &&
      setSubdomainType(data.attributes.flat_subdomains ? 'flat' : 'nested')
  }, [data, query])

  return useMemo(
    () => makeSessionAPI(client, subdomainType),
    [client, subdomainType],
  )
}
