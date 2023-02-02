import CozyClient from 'cozy-client'

import { LauncherContext } from '/libs/connectors/models'
import { useLauncherClient } from '/screens/home/hooks/useLauncherClient'

const isLauncherReady = (
  context: LauncherContext
): context is LauncherContext => context.state !== 'default'

const isClientReady = (client: CozyClient | undefined): client is CozyClient =>
  Boolean(client)

export const useLauncherWrapper = (
  launcherContext: LauncherContext
): {
  canDisplayLauncher: () => boolean
  launcherClient?: CozyClient
} => {
  const { launcherClient } = useLauncherClient(launcherContext.value)

  const canDisplayLauncher = (): boolean => {
    if (!isLauncherReady(launcherContext)) {
      return false
    }

    if (!isClientReady(launcherClient)) {
      return false
    }

    return true
  }

  return {
    canDisplayLauncher,
    launcherClient
  }
}
