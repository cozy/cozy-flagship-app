import { useState, useEffect } from 'react'
import messaging from '@react-native-firebase/messaging'

import { useClient } from 'cozy-client'
import { removeNotificationDeviceToken } from '/libs/client'
import {
  handleNotificationTokenReceiving,
  handleNotificationOpening,
  requestAndGetNotificationPermission
} from '/libs/notifications/notifications'

export const useNotifications = () => {
  const client = useClient()

  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(false)

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!client) return

      const permission = await requestAndGetNotificationPermission()

      if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
        setAreNotificationsEnabled(true)
      } else if (permission === messaging.AuthorizationStatus.DENIED) {
        await removeNotificationDeviceToken(client)
      }
    }

    initializeNotifications()
  }, [client])

  useEffect(() => {
    const handleNotifications = async () => {
      if (areNotificationsEnabled) {
        const removeNotificationTokenReceivingHandler =
          await handleNotificationTokenReceiving(client)
        const removeNotificationOpeningHandler =
          await handleNotificationOpening(client)

        return () => {
          removeNotificationTokenReceivingHandler()
          removeNotificationOpeningHandler()
        }
      }
    }
    handleNotifications()
  }, [client, areNotificationsEnabled])
}
