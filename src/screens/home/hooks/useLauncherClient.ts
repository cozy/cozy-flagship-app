import { useState, useEffect } from 'react'

import CozyClient, { useClient } from 'cozy-client'

import { LauncherContextValue } from '/libs/konnectors/models'
import { getLauncherClient } from '/libs/konnectors/getLauncherClient'

interface useLauncherClientReturn {
  launcherClient?: CozyClient
}

export const useLauncherClient = (
  launcherContextValue?: LauncherContextValue
): useLauncherClientReturn => {
  const [launcherClient, setLauncherClient] = useState<CozyClient>()
  const client = useClient()

  useEffect(() => {
    if (!client) return

    const slug = launcherContextValue?.konnector.slug

    if (slug)
      void getLauncherClient(
        client,
        launcherContextValue.konnector,
        setLauncherClient
      )
    else setLauncherClient(undefined)
  }, [client, launcherContextValue?.konnector])

  return { launcherClient }
}
