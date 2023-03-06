import { useState, useEffect } from 'react'
import messaging from '@react-native-firebase/messaging'

import { useClient } from 'cozy-client'

import { removeNotificationDeviceToken } from '/libs/client'
import {
  handleInitialToken,
  handleNotificationTokenReceiving,
  handleInitialNotification,
  handleNotificationOpening,
  requestAndGetNotificationPermission
} from '/libs/notifications/notifications'

export const useNotifications = (): void => {
  const client = useClient()

  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(false)

  useEffect(() => {
    const initializeNotifications = async (): Promise<void> => {
      if (!client) return

      const permission = await requestAndGetNotificationPermission()

      if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
        setAreNotificationsEnabled(true)
      } else if (permission === messaging.AuthorizationStatus.DENIED) {
        await removeNotificationDeviceToken(client)
      }
    }

    void initializeNotifications()
  }, [client])

  useEffect(() => {
    if (!areNotificationsEnabled) return
    if (!client) return

    void handleInitialToken(client)
    void handleInitialNotification(client)

    const removeTokenReceivingHandler = handleNotificationTokenReceiving(client)
    const removeOpeningHandler = handleNotificationOpening(client)

    return () => {
      removeTokenReceivingHandler()
      removeOpeningHandler()
    }
  }, [client, areNotificationsEnabled])
}
