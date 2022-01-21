import {useClient} from 'cozy-client'

import {
  consumeSessionToken,
  handleCreateSession,
  handleInterceptAuth,
  resetSessionToken,
  shouldCreateSession,
  shouldInterceptAuth,
} from '../libs/functions/session'

export const useSession = () => {
  const client = useClient()

  return {
    consumeSessionToken,
    handleCreateSession: handleCreateSession(client),
    handleInterceptAuth: handleInterceptAuth(client),
    resetSessionToken,
    shouldCreateSession,
    shouldInterceptAuth: shouldInterceptAuth(client),
  }
}
