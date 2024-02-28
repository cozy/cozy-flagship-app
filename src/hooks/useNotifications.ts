import { useCallback, useState, useEffect } from 'react'
import RNRestart from 'react-native-restart'

import { useClient } from 'cozy-client'

import { useRestartContext } from '/components/providers/RestartProvider'
import { useSplashScreen } from '/hooks/useSplashScreen'
import { removeNotificationDeviceToken } from '/libs/client'
import {
  handleInitialToken,
  handleNotificationTokenReceiving,
  handleInitialServerNotification,
  handleInitialLocalNotification,
  handleServerNotificationOpening,
  handleServerNotificationOnForeground,
  handleLocalNotificationOpening
} from '/libs/notifications/notifications'
import { checkNotifications } from '/app/domain/nativePermissions'

export const useNotifications = (): void => {
  const client = useClient()

  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(false)

  const { unmountAppForRestart } = useRestartContext()

  const { showSplashScreen } = useSplashScreen()

  const restart = useCallback(async () => {
    await showSplashScreen()
    unmountAppForRestart()
    RNRestart.Restart()
  }, [showSplashScreen, unmountAppForRestart])

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
    void handleInitialServerNotification(client, restart)
    void handleInitialLocalNotification(client, restart)

    const removeTokenReceivingHandler = handleNotificationTokenReceiving(client)
    const removeOpeningHandler = handleServerNotificationOpening(
      client,
      restart
    )
    const removeLocalNotificationHandler = handleLocalNotificationOpening(
      client,
      restart
    )
    const removeServerForegroundHandler = handleServerNotificationOnForeground()

    return () => {
      removeTokenReceivingHandler()
      removeOpeningHandler()
      removeServerForegroundHandler()
      removeLocalNotificationHandler()
    }
  }, [client, areNotificationsEnabled, restart])
}
