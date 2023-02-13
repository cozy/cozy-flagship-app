import { useEffect } from 'react'

import { useClient } from 'cozy-client'
import { handleNotificationOpening } from '/libs/notifications/notifications'

export const useNotifications = () => {
  const client = useClient()

  useEffect(() => {
    if (client) {
      handleNotificationOpening(client)
    }
  }, [client])
}
