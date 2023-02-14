import { useState, useEffect } from 'react'

import CozyClient, { useClient } from 'cozy-client'

import { LauncherContextValue } from '/libs/connectors/models'
import { getLauncherClient } from '/libs/connectors/getLauncherClient'

interface useLauncherClientReturn {
  launcherClient?: CozyClient
}

export const useLauncherClient = (
  launcherContextValue?: LauncherContextValue
): useLauncherClientReturn => {
  const [launcherClient, setLauncherClient] = useState<CozyClient>()
  const client = useClient()

  useEffect(() => {
    const slug = launcherContextValue?.connector.slug

    if (slug) void getLauncherClient(client, slug, setLauncherClient)
    else setLauncherClient(undefined)
  }, [client, launcherContextValue?.connector.slug])

  return { launcherClient }
}
