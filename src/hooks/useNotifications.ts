import { useState, useEffect } from 'react'

import { useClient } from 'cozy-client'

import { removeNotificationDeviceToken } from '/libs/client'
import {
  handleInitialToken,
  handleNotificationTokenReceiving,
  handleInitialServerNotification,
  handleServerNotificationOpening
} from '/libs/notifications/notifications'
import { checkNotifications } from '/app/domain/nativePermissions'

export const useNotifications = (): void => {
  const client = useClient()

  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(false)

  useEffect(() => {
    const initializeNotifications = async (): Promise<void> => {
      if (!client) return

      const permission = await checkNotifications()

      if (permission.granted) {
        setAreNotificationsEnabled(true)
      } else if (!permission.granted && !permission.canRequest) {
        await removeNotificationDeviceToken(client)
      }
    }

    void initializeNotifications()
  }, [client])

  useEffect(() => {
    if (!areNotificationsEnabled) return
    if (!client) return

    void handleInitialToken(client)
    void handleInitialServerNotification(client)

    const removeTokenReceivingHandler = handleNotificationTokenReceiving(client)
    const removeOpeningHandler = handleServerNotificationOpening(client)

    return () => {
      removeTokenReceivingHandler()
      removeOpeningHandler()
    }
  }, [client, areNotificationsEnabled])
}
