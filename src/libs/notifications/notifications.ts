import messaging from '@react-native-firebase/messaging'

import Minilog from 'cozy-minilog'

import notifee, { Event } from '@notifee/react-native'

import CozyClient, {
  generateWebLink,
  deconstructRedirectLink
} from 'cozy-client'

import { navigate } from '/libs/RootNavigation'
import { navigateToApp } from '/libs/functions/openApp'
import { saveNotificationDeviceToken } from '/libs/client'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { routes } from '/constants/routes'

const log = Minilog('🔔 notifications')

/*
For notifee.getInitialNotification, we can see that it is "deprecated for iOS in favour of onForegroundEvent, you can still
use this method on iOS but you will also receive a onForegroundEvent". Even if we never had the case because the onForegroundEvent
handler is called too late to catch an initial notification in our app, we add a lastLocalNotificationId in case
we receive two times the notification.
*/
let lastLocalNotificationId: string | undefined = undefined

export const navigateFromNotification = async (
  client: CozyClient,
  redirectLink: string
): Promise<void> => {
  try {
    const { slug, pathname, hash } = deconstructRedirectLink(redirectLink)

    const subDomainType = client.getInstanceOptions().capabilities
      .flat_subdomains
      ? 'flat'
      : 'nested'

    const href = generateWebLink({
      cozyUrl: client.getStackClient().uri,
      subDomainType,
      slug,
      pathname,
      hash,
      searchParams: []
    })

    if (slug === 'home') {
      navigate(routes.home, {
        href
      })
    } else {
      await navigateToApp({
        navigation: { navigate },
        slug,
        href,
        iconParams: undefined
      })
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to navigate from notification: ${errorMessage}`
    )
  }
}

const handleNotificationEvent = async (
  client: CozyClient,
  restart: () => Promise<void>,
  notification: Record<string, string | number | object> | undefined
): Promise<void> => {
  if (!notification) return

  if (
    notification.redirectLink &&
    typeof notification.redirectLink === 'string'
  ) {
    log.debug('Handle navigation notification')
    await navigateFromNotification(client, notification.redirectLink)
  }

  if (notification.refresh) {
    log.debug('Handle restart notification')
    await restart()
  }
}

/**
 * Called when the user clicks on a notification received from Firebase
 * and when the app is not running
 *
 * @param client - CozyClient instance
 * @param restart - Method used to restart the App
 */
export const handleInitialServerNotification = async (
  client: CozyClient,
  restart: () => Promise<void>
): Promise<void> => {
  const notification = await messaging().getInitialNotification()

  if (notification?.data?.refresh) {
    log.info('Ignored refresh on app start to avoid infinite loop')
    delete notification.data.refresh
  }

  await handleNotificationEvent(client, restart, notification?.data)
}

/**
 * Called when the user clicks on a notification generated by `showLocalNotification`
 * and when the app is not running
 *
 * @param client - CozyClient instance
 */
export const handleInitialLocalNotification = async (
  client: CozyClient,
  restart: () => Promise<void>
): Promise<void> => {
  const notification = await notifee.getInitialNotification()

  const notificationId = notification?.notification.id

  if (
    notificationId !== undefined &&
    notificationId === lastLocalNotificationId
  ) {
    log.error(
      'Received twice the same notification in handleInitialLocalNotification'
    )
    return
  }

  lastLocalNotificationId = notificationId

  if (notification?.notification.data?.refresh) {
    log.info('Ignored refresh on app start to avoid infinite loop')
    delete notification.notification.data.refresh
  }

  void handleNotificationEvent(client, restart, notification?.notification.data)
}

/**
 * Called when the user clicks on a notification received from Firebase
 * and when the app is in Background
 *
 * @param client - CozyClient instance
 * @param restart - Method used to restart the App
 * @returns Method to unregister the handler
 */
export const handleServerNotificationOpening = (
  client: CozyClient,
  restart: () => Promise<void>
): (() => void) => {
  notifee.onBackgroundEvent(async (event: Event) => {
    log.debug('Received notification from onBackgroundEvent event')

    await handleNotificationEvent(
      client,
      restart,
      event.detail.notification?.data
    )
  })

  return messaging().onNotificationOpenedApp(async notification => {
    log.debug('Received notification from onNotificationOpenedApp event')

    await handleNotificationEvent(client, restart, notification.data)
  })
}

/**
 * Called twice when receiving a notification generated by `showLocalNotification`
 *
 * First when the notification is displayed
 * Second when the notificatin is clicked
 *
 * This is called when the user clicks on a notification if the app is in
 * Foreground or in Background
 *
 * @param client - CozyClient instance
 * @param restart - Method used to restart the App
 * @returns Method to unregister the handler
 */
export const handleLocalNotificationOpening = (
  client: CozyClient,
  restart: () => Promise<void>
): (() => void) => {
  return notifee.onForegroundEvent((event: Event) => {
    // If no pressAction this mean the handler has been triggered
    // by `showLocalNotification` but the user did not clicked on it yet
    if (!event.detail.pressAction) return

    const notificationId = event.detail.notification?.id

    if (notificationId === lastLocalNotificationId) {
      log.error(
        'Received twice the same notification in handleLocalNotificationOpening'
      )
      return
    }

    lastLocalNotificationId = notificationId

    log.debug('Received notification from notifee.onForegroundEvent event')

    void handleNotificationEvent(
      client,
      restart,
      event.detail.notification?.data
    )
  })
}

/**
 * When receiving a server notification while the App is in Foreground
 * then no OS notification toast is displayed
 *
 * Instead the App will directly receive the notification message
 *
 * We want this message to be redirected as a displayed toast
 *
 * @returns Method to unregister the handler
 */
export const handleServerNotificationOnForeground = (): (() => void) => {
  return messaging().onMessage(async notification => {
    log.debug('Received notification from onMessage event')

    if (!notification.notification?.title || !notification.notification.body) {
      log.error('Received a notification without title or body. Skip.')
      return
    }

    await showLocalNotification({
      title: notification.notification.title,
      body: notification.notification.body,
      data: notification.data
    })
  })
}

export const handleInitialToken = async (client: CozyClient): Promise<void> => {
  try {
    const initialToken = await messaging().getToken()

    if (initialToken) {
      void saveNotificationDeviceToken(client, initialToken)
    }
  } catch (e) {
    /*
      When Google Play Services are not installed on Android, getToken throws errors.
      We can do nothing about it so we catch them silently.
    */
  }
}

export const handleNotificationTokenReceiving = (
  client: CozyClient
): (() => void) => {
  return messaging().onTokenRefresh(token => {
    void saveNotificationDeviceToken(client, token)
  })
}

export interface LocalNotification {
  title: string
  body: string
  data?: undefined | Record<string, string>
}

export const showLocalNotification = async (
  localNotification: LocalNotification
): Promise<void> => {
  const channelId = await notifee.createChannel({
    id: 'cozy',
    name: 'Cozy'
  })

  await notifee.displayNotification({
    title: localNotification.title,
    body: localNotification.body,
    data: localNotification.data,
    android: {
      channelId,
      smallIcon: 'ic_stat_ic_notification',
      pressAction: {
        id: 'default'
      }
    }
  })
}
