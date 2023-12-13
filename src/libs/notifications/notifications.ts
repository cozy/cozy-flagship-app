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
}

/**
 * Called when the user clicks on a notificaiton received from Firebase
 * and when the app is not running
 *
 * @param client - CozyClient instance
 */
export const handleInitialServerNotification = async (
  client: CozyClient
): Promise<void> => {
  const notification = await messaging().getInitialNotification()

  await handleNotificationEvent(client, notification?.data)
}

/**
 * Called when the user clicks on a notificaiton received from Firebase
 * and when the app is in Background
 *
 * @param client - CozyClient instance
 * @returns Method to unregister the handler
 */
export const handleServerNotificationOpening = (
  client: CozyClient
): (() => void) => {
  notifee.onBackgroundEvent(async (event: Event) => {
    log.debug('Received notification from onBackgroundEvent event')

    await handleNotificationEvent(client, event.detail.notification?.data)
  })

  return messaging().onNotificationOpenedApp(async notification => {
    log.debug('Received notification from onNotificationOpenedApp event')

    await handleNotificationEvent(client, notification.data)
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
