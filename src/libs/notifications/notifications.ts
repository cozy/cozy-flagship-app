import { Platform } from 'react-native'
import messaging, {
  FirebaseMessagingTypes
} from '@react-native-firebase/messaging'

import Minilog from 'cozy-minilog'

import notifee from '@notifee/react-native'

import CozyClient, {
  generateWebLink,
  deconstructRedirectLink
} from 'cozy-client'

import { navigate } from '/libs/RootNavigation'
import { navigateToApp } from '/libs/functions/openApp'
import { saveNotificationDeviceToken } from '/libs/client'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('notifications')

interface NotificationData {
  redirectLink: string
}

export const navigateFromNotification = async (
  client: CozyClient,
  notification: FirebaseMessagingTypes.RemoteMessage
): Promise<void> => {
  const { data: { redirectLink } = {} as NotificationData } = notification

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

    await navigateToApp({
      navigation: { navigate },
      slug,
      href,
      iconParams: undefined
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    log.error(
      `Something went wrong while trying to navigate from notification: ${errorMessage}`
    )
  }
}

export const handleInitialNotification = async (
  client: CozyClient
): Promise<void> => {
  const initialNotification = await messaging().getInitialNotification()

  if (initialNotification) {
    await navigateFromNotification(client, initialNotification)
  }
}

export const handleNotificationOpening = (client: CozyClient): (() => void) => {
  return messaging().onNotificationOpenedApp(async notification => {
    await navigateFromNotification(client, notification)
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

const requestAndGetIosNotificationPermission =
  async (): Promise<FirebaseMessagingTypes.AuthorizationStatus> => {
    return await messaging().requestPermission()
  }

/*
 * Because we target Android 12, Android handles automatically notification permission request if needed.
 * But messaging().requestPermission() never return the correct permission contrary to messaging().hasPermission().
 * When we will target Android 13, we will need to handles manually notification permission request.
 */
const requestAndGetAndroidNotificationPermission =
  async (): Promise<FirebaseMessagingTypes.AuthorizationStatus> => {
    return await messaging().hasPermission()
  }

export const requestAndGetNotificationPermission =
  async (): Promise<FirebaseMessagingTypes.AuthorizationStatus> => {
    if (Platform.OS === 'ios') {
      return await requestAndGetIosNotificationPermission()
    } else if (Platform.OS === 'android') {
      return await requestAndGetAndroidNotificationPermission()
    }
    return messaging.AuthorizationStatus.NOT_DETERMINED
  }

export interface LocalNotification {
  title: string
  body: string
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
    android: {
      channelId,
      smallIcon: 'ic_stat_ic_notification'
    }
  })
}
