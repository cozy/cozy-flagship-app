import messaging from '@react-native-firebase/messaging'

import { generateWebLink } from 'cozy-client'
import { navigate } from '/libs/RootNavigation'
import { navigateToApp } from '/libs/functions/openApp'

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
