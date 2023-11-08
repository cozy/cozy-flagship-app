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
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { navigate, navigationRef } from '/libs/RootNavigation'
import {
  showClouderyOffer,
  formatClouderyOfferUrlWithInAppPurchaseParams,
  isClouderyOfferUrl
} from '/app/domain/iap/services/clouderyOffer'

const log = Minilog('⛔ OAuth Clients Limit Service')

export const OAUTH_CLIENTS_LIMIT_EXCEEDED_URL_PATH =
  '/settings/clients/limit-exceeded'

export const OAUTH_CLIENTS_LIMIT_EXCEEDED = 'OAUTH_CLIENTS_LIMIT_EXCEEDED'

export const oauthClientLimitEventHandler = new EventEmitter()

export const showOauthClientsLimitExceeded = (href: string): void => {
  navigate('home')
  oauthClientLimitEventHandler.emit(OAUTH_CLIENTS_LIMIT_EXCEEDED, href)
}

export const isOauthClientLimitExceededUrl = (url: string): boolean => {
  return url.includes(OAUTH_CLIENTS_LIMIT_EXCEEDED_URL_PATH)
}

export const interceptNavigation =
  (
    initialUrl: string,
    closePopup: () => void,
    client: CozyClient | null,
    navigation: NavigationProp<ParamListBase>
  ) =>
  (request: WebViewNavigation): boolean => {
    try {
      if (client === null) {
        log.error('Client is null, should not happen')
        return false
      }

      const destinationUrl = cleanUrl(request.url)

      if (isClouderyOfferUrl(destinationUrl)) {
        const clouderyOfferUrlWithInAppPurchaseParams =
          formatClouderyOfferUrlWithInAppPurchaseParams(destinationUrl)
        showClouderyOffer(clouderyOfferUrlWithInAppPurchaseParams)
        return false
      }

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

      if (destinationUrlData.slug === 'home') {
        log.debug(
          `Destination URL is Home which should already be rendered in background, only close popup to reveal the HomeView`
        )
        closePopup()
      } else if (currentRouteName !== routes.default) {
        log.debug(
          `Current route is not Home but ${currentRouteName}, only close popup and don't interrupt user`
        )
        closePopup()
      } else {
        log.debug(
          `Current route is Home, close popup and navigate to ${destinationUrl}`
        )
        closePopup()
        void navigateToApp({
          navigation,
          href: destinationUrl,
          slug: destinationUrlData.slug
        })
      }

      return false
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      log.error(
        `Error while analysing WebView navigation. Intercept it anyway to prevent unexpected behavior: ${errorMessage}`
      )

      return false
    }
  }

export const interceptOpenWindow =
  (client: CozyClient | null, navigation: NavigationProp<ParamListBase>) =>
  (syntheticEvent: WebViewOpenWindowEvent): void => {
    try {
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
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      log.error(`Error while intercepting WebView openWindow: ${errorMessage}`)
    }
  }

const cleanUrl = (url: string): string => {
  return url.endsWith('#') ? url.replace('#', '') : url
}
