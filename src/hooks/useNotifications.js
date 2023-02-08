import { useEffect } from 'react'

import { useClient } from 'cozy-client'
import {
  handleNotificationTokenReceiving,
  handleNotificationOpening
} from '/libs/notifications/notifications'

export const useNotifications = () => {
  const client = useClient()

  useEffect(() => {
    if (client) {
      handleNotificationTokenReceiving(client)
      handleNotificationOpening(client)
    }
  }, [client])
}
