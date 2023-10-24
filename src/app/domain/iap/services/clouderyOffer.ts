import { EventEmitter } from 'events'

import { Platform } from 'react-native'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import Minilog from 'cozy-minilog'

import { navigate } from '/libs/RootNavigation'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('💳 Cloudery Offer')

export const CLOUDERY_OFFER = 'CLOUDERY_OFFER'

const START_IAP_URL = 'https://iapflagship'

export const clouderyOfferEventHandler = new EventEmitter()

export const showClouderyOffer = (href: string): void => {
  navigate('home')
  clouderyOfferEventHandler.emit(CLOUDERY_OFFER, href)
}

export const formatClouderyOfferUrlWithInAppPurchaseParams = (
  clouderyOfferString: string
): string => {
  const clouderyOfferUrl = new URL(clouderyOfferString)

  clouderyOfferUrl.searchParams.set('iap_vendor', Platform.OS)
  clouderyOfferUrl.searchParams.set('iap_url', START_IAP_URL)

  return clouderyOfferUrl.toString()
}

export const isClouderyOfferUrl = (url: string): boolean => {
  return url.includes('premium')
}

export const isStartIapUrl = (url: string): boolean => {
  return url.includes(START_IAP_URL)
}

export const interceptNavigation =
  () =>
  (request: WebViewNavigation): boolean => {
    try {
      if (isStartIapUrl(request.url)) {
        const url = new URL(request.url)
        const productId = url.searchParams.get('productId')
        log.debug('Should start IAP with productId', productId)
      }

      return true
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      log.error(
        `Error while analysing WebView navigation. Intercept it anyway to prevent unexpected behavior: ${errorMessage}`
      )

      return false
    }
  }
