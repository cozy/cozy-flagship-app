import { useClient } from 'cozy-client'

import { isSecureProtocol } from '../libs/functions/isSecureProtocol'

export const useIsSecureProtocol = () => {
  const client = useClient()

  return isSecureProtocol(client)
}
