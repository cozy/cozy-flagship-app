import { useState, useEffect } from 'react'

import CozyClient, { useClient } from 'cozy-client'

import { LauncherContext } from '/libs/connectors/models'
import { getLauncherClient } from '/libs/connectors/getLauncherClient'

interface useLauncherClientReturn {
  launcherClient?: CozyClient
}
export const useLauncherClient = (
  launcherContext?: LauncherContext
): useLauncherClientReturn => {
  const [launcherClient, setLauncherClient] = useState<CozyClient>()
  const client = useClient()

  useEffect(() => {
    const slug = launcherContext?.job?.message?.konnector

    if (slug) void getLauncherClient(client, slug, setLauncherClient)
    else setLauncherClient(undefined)
  }, [client, launcherContext?.job?.message?.konnector])

  return { launcherClient }
}
