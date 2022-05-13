import { useClient, useQuery, Q, isQueryLoading } from 'cozy-client'
import { useEffect, useMemo, useState } from 'react'

import Minilog from '@cozy/minilog'

import { makeSessionAPI } from '/libs/functions/session'
import { NetService } from '/libs/services/NetService'
import { routes } from '/constants/routes'
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
    NetService.isConnected()
      .then(isConnected => {
        if (isConnected) return

        NetService.toggleNetWatcher({ callbackRoute: routes.stack })
        NetService.handleOffline()
        return hideSplashScreen()
      })
      .catch(reason => Minilog('useSession').error(reason))

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
