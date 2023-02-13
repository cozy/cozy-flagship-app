import { Platform } from 'react-native'
import messaging from '@react-native-firebase/messaging'

import { generateWebLink } from 'cozy-client'
import { navigate } from '/libs/RootNavigation'
import { navigateToApp } from '/libs/functions/openApp'
import { saveNotificationDeviceToken } from '/libs/client'

export const navigateFromNotification = (client, notification) => {
  const { data: { pathname, url, slug } = {} } = notification

  if (!pathname || !url || !slug) return

  const subDomainType = client.getInstanceOptions().capabilities.flat_subdomains
    ? 'flat'
    : 'nested'

  const href = generateWebLink({
    cozyUrl: client.getStackClient().uri,
    subDomainType,
    pathname,
    hash: url,
    slug
  })

  navigateToApp({
    navigation: { navigate },
    href,
    slug
  })
}

export const handleNotificationOpening = async client => {
  const initialNotification = await messaging().getInitialNotification()

  if (initialNotification) {
    navigateFromNotification(client, initialNotification)
  }

  messaging().onNotificationOpenedApp(notification => {
    navigateFromNotification(client, notification)
  })
}

export const handleNotificationTokenReceiving = async client => {
  const initialToken = await messaging().getToken()

  if (initialToken) {
    saveNotificationDeviceToken(client, initialToken)
  }

  messaging().onTokenRefresh(token => {
    saveNotificationDeviceToken(client, token)
  })
}

const requestAndGetIosNotificationPermission = async () => {
  return await messaging().requestPermission()
}

/*
 * Because we target Android 12, Android handles automatically notification permission request if needed.
 * But messaging().requestPermission() never return the correct permission contrary to messaging().hasPermission().
 * When we will target Android 13, we will need to handles manually notification permission request.
 */
const requestAndGetAndroidNotificationPermission = async () => {
  return await messaging().hasPermission()
}

export const requestAndGetNotificationPermission = async () => {
  if (Platform.OS === 'ios') {
    return await requestAndGetIosNotificationPermission()
  } else if (Platform.OS === 'android') {
    return await requestAndGetAndroidNotificationPermission()
  }
  return messaging.AuthorizationStatus.NOT_DETERMINED
}
