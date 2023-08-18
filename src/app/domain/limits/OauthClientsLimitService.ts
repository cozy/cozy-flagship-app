import { EventEmitter } from 'events'

import { NavigationProp, ParamListBase } from '@react-navigation/native'
import type {
  WebViewOpenWindowEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes'

import type CozyClient from 'cozy-client'
import { deconstructCozyWebLinkWithSlug } from 'cozy-client'
import Minilog from 'cozy-minilog'

import { routes } from '/constants/routes'
import { navigateToApp } from '/libs/functions/openApp'
import { navigate, navigationRef } from '/libs/RootNavigation'

const log = Minilog('⛔ OAuth Clients Limit Service')

export const OAUTH_CLIENTS_LIMIT_EXCEEDED = 'OAUTH_CLIENTS_LIMIT_EXCEEDED'

export const oauthClientLimitEventHandler = new EventEmitter()

export const showOauthClientsLimitExceeded = (): void => {
  navigate('home')
  oauthClientLimitEventHandler.emit(OAUTH_CLIENTS_LIMIT_EXCEEDED)
}

export const interceptNavigation =
  (
    initialUrl: string,
    closePopup: () => void,
    client: CozyClient | null,
    navigation: NavigationProp<ParamListBase>
  ) =>
  (request: WebViewNavigation): boolean => {
    if (client === null) {
      log.error('Client is null, should not happen')
      return false
    }

    const destinationUrl = cleanUrl(request.url)
    const subdomainType = client.capabilities.flat_subdomains
      ? 'flat'
      : 'nested'

    if (destinationUrl === initialUrl) {
      return true
    }

    const destinationUrlData = deconstructCozyWebLinkWithSlug(
      destinationUrl,
      subdomainType
    )

    if (!destinationUrlData.slug) {
      return false
    }

    const currentRouteName =
      navigationRef.current?.getCurrentRoute()?.name ?? ''

    if (currentRouteName === routes.default) {
      log.debug(
        `Current route is Home, close popup and navigate to ${destinationUrl}`
      )
      closePopup()
      void navigateToApp({
        navigation,
        href: destinationUrl,
        slug: destinationUrlData.slug
      })
    } else {
      log.debug(
        `Current route is not Home but ${currentRouteName}, only close popup and don't interrupt user`
      )
      closePopup()
    }

    return false
  }

export const interceptOpenWindow =
  (client: CozyClient | null, navigation: NavigationProp<ParamListBase>) =>
  (syntheticEvent: WebViewOpenWindowEvent): void => {
    if (client === null) {
      log.error('Client is null, should not happen')
      return
    }

    const { nativeEvent } = syntheticEvent
    const destinationUrl = nativeEvent.targetUrl

    const subdomainType = client.capabilities.flat_subdomains
      ? 'flat'
      : 'nested'

    const destinationUrlData = deconstructCozyWebLinkWithSlug(
      destinationUrl,
      subdomainType
    )

    if (destinationUrlData.slug) {
      void navigateToApp({
        navigation,
        href: destinationUrl,
        slug: destinationUrlData.slug
      })
    }
  }

const cleanUrl = (url: string): string => {
  return url.endsWith('#') ? url.replace('#', '') : url
}
