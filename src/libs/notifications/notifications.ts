import { Platform } from 'react-native'
import messaging, {
  FirebaseMessagingTypes
} from '@react-native-firebase/messaging'

import CozyClient, { generateWebLink } from 'cozy-client'
import { navigate } from '/libs/RootNavigation'
import { navigateToApp } from '/libs/functions/openApp'
import { saveNotificationDeviceToken } from '/libs/client'

interface NotificationData {
  pathname: string
  url: string
  slug: string
  appName: string
}

export const navigateFromNotification = (
  client: CozyClient,
  notification: FirebaseMessagingTypes.RemoteMessage
): void => {
  const { data: { pathname, url, slug } = {} as NotificationData } =
    notification

  if (!pathname || !url || !slug) return

  const subDomainType = client.getInstanceOptions().capabilities.flat_subdomains
    ? 'flat'
    : 'nested'

  const href = generateWebLink({
    cozyUrl: client.getStackClient().uri,
    subDomainType,
    pathname,
    hash: url,
    slug,
    searchParams: []
  })

  navigateToApp({
    navigation: { navigate },
    href,
    slug,
    iconParams: undefined
  })
}

export const handleNotificationOpening = async (
  client: CozyClient
): Promise<void> => {
  const initialNotification = await messaging().getInitialNotification()

  if (initialNotification) {
    navigateFromNotification(client, initialNotification)
  }

  messaging().onNotificationOpenedApp(notification => {
    navigateFromNotification(client, notification)
  })
}

export const handleNotificationTokenReceiving = async (
  client: CozyClient
): Promise<void> => {
  const initialToken = await messaging().getToken()

  if (initialToken) {
    void saveNotificationDeviceToken(client, initialToken)
  }

  messaging().onTokenRefresh(token => {
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
