import {useClient, Q} from 'cozy-client'
import {useEffect, useState} from 'react'

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
  const [subdomain, setSubdomain] = useState()

  useEffect(() => {
    const getSubdomain = async () => {
      const query = await client.query(
        Q('io.cozy.settings').getById('capabilities'),
      )

      if (query) {
        setSubdomain(query.data.attributes.flat_subdomains ? 'flat' : 'nested')
      }
    }

    getSubdomain()
  }, [client, subdomain])

  return {
    consumeSessionToken,
    handleCreateSession: handleCreateSession(client),
    handleInterceptAuth: handleInterceptAuth(client, subdomain),
    resetSessionToken,
    shouldCreateSession,
    shouldInterceptAuth: shouldInterceptAuth(client),
  }
}
