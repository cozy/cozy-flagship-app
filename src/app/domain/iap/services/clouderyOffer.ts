import { EventEmitter } from 'events'

import { navigate } from '/libs/RootNavigation'

import { Platform } from 'react-native'

export const CLOUDERY_OFFER = 'CLOUDERY_OFFER'

const START_IAP_REDIRECT_URL = 'https://iapflagship'

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
  clouderyOfferUrl.searchParams.set('iap_url', START_IAP_REDIRECT_URL)

  return clouderyOfferUrl.toString()
}

export const isClouderyOfferUrl = (url: string): boolean => {
  return url.includes('premium')
}
