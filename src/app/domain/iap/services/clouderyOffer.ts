import { EventEmitter } from 'events'

import { Dispatch, SetStateAction } from 'react'
import { Linking, Platform } from 'react-native'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import CozyClient from 'cozy-client'
import type { InstanceInfo } from 'cozy-client/types/types'
import Minilog from 'cozy-minilog'

import {
  clearTransactionIOS,
  ProrationModesAndroid,
  requestSubscription,
  Subscription,
  SubscriptionAndroid,
  SubscriptionOffer
} from '/app/domain/iap/services/iapModule'
import { BuyingState } from '/app/view/IAP/hooks/useClouderyOffer'
import { getErrorMessage } from '/libs/functions/getErrorMessage'

const log = Minilog('💳 Cloudery Offer')

export const CLOUDERY_OFFER = 'CLOUDERY_OFFER'

const START_IAP_URL = 'https://iapflagship'

export const clouderyOfferEventHandler = new EventEmitter()

export const showClouderyOffer = (href: string): void => {
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

export const isClouderyOfferUrl = (
  url: string,
  instanceInfo: InstanceInfo | undefined
): boolean => {
  const manager_url = instanceInfo?.context?.data?.manager_url ?? ''
  const uuid = instanceInfo?.instance?.data?.uuid ?? ''
  return url.startsWith(`${manager_url}/cozy/instances/${uuid}/premium`)
}

export const interceptNavigation =
  (
    client: CozyClient | null,
    instanceInfo: InstanceInfo,
    subscriptions: Subscription[],
    setBuyingState: Dispatch<SetStateAction<BuyingState>>,
    subscribed: () => void
  ) =>
  (request: WebViewNavigation): boolean => {
    log.debug('Navigating to', request.url)
    try {
      if (isOsStoreUrl(request.url)) {
        void Linking.openURL(request.url)
        return false
      }

      if (isStartIapUrl(request.url)) {
        const url = new URL(request.url)
        const productId = url.searchParams.get('productId')
        const planId = url.searchParams.get('planId')
        const purchaseToken = url.searchParams.get('purchaseToken')
        const prorationMode = url.searchParams.get('prorationMode')

        if (!productId) {
          log.error('The IAP url do not contain any product ID')
          return false
        }

        log.debug('Should start IAP on navigation with productId', productId)
        void buySubscription(
          client,
          productId,
          planId,
          purchaseToken,
          prorationMode,
          instanceInfo,
          subscriptions,
          setBuyingState,
          subscribed
        )
        return false
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

const isStartIapUrl = (url: string): boolean => {
  return url.startsWith(START_IAP_URL)
}

const isOsStoreUrl = (url: string): boolean => {
  return (
    url.startsWith('https://apps.apple.com/account/subscriptions') ||
    url.startsWith('https://play.google.com/store/account/subscriptions')
  )
}

export const buySubscription = async (
  client: CozyClient | null,
  productId: string,
  planId: string | null,
  purchaseToken: string | null,
  prorationMode: string | null,
  instanceInfo: InstanceInfo,
  subscriptions: Subscription[],
  setBuyingState: Dispatch<SetStateAction<BuyingState>>,
  subscribed: () => void
): Promise<void> => {
  log.debug('Buy subscription', productId)

  if (!client) {
    throw new Error('CozyClient should be defined')
  }

  try {
    setBuyingState({
      state: 'BUYING',
      productId,
      planId,
      purchaseToken,
      prorationMode
    })
    if (Platform.OS === 'ios') {
      log.debug('Clear iOS transactions')
      await clearTransactionIOS()

      log.debug('Request iOS subscription')
      await requestSubscription({
        sku: productId,
        appAccountToken: instanceInfo.instance.data.uuid
      })
    } else {
      if (!planId) {
        throw new Error('No planId set on Android, should not happen')
      }
      const offers = getSubscriptionOffers(productId, planId, subscriptions)

      // For Android, cozy-stack needs to know the cozy UUID + its base domain
      const baseDomain = extractBaseCozyDomain(client)
      const accountId = `${baseDomain}/${instanceInfo.instance.data.uuid ?? ''}`

      log.debug('Request Android subscription')
      await requestSubscription({
        sku: productId,
        appAccountToken: accountId,
        obfuscatedAccountIdAndroid: accountId,
        subscriptionOffers: offers,
        purchaseTokenAndroid: purchaseToken ?? undefined,
        prorationModeAndroid: parseProrationMode(prorationMode)
      })
    }

    subscribed()
  } catch (error: unknown) {
    if (isUserCanceledError(error)) {
      log.debug('User canceled purchase')
      setBuyingState({
        state: 'IDLE'
      })
      return
    }

    const errorMessage = getErrorMessage(error)
    log.error(
      `Error while analysing WebView navigation. Intercept it anyway to prevent unexpected behavior: ${errorMessage}`
    )
    setBuyingState({
      state: 'ERROR',
      productId,
      planId,
      purchaseToken,
      prorationMode
    })
  }
}

const getSubscriptionOffers = (
  productId: string,
  planId: string,
  subscriptions: Subscription[]
): SubscriptionOffer[] => {
  log.debug('Get Subscription offers')

  if (Platform.OS !== 'android') {
    throw new Error('getSubscriptionOffers should not be called on iOS')
  }

  const subscriptionsAndroid = subscriptions as SubscriptionAndroid[]

  const subscription = subscriptionsAndroid.find(s => s.productId === productId)

  if (!subscription) {
    throw new Error(`No subscription found for ${productId}`)
  }

  const offers = subscription.subscriptionOfferDetails
    .filter(offerDetails => offerDetails.basePlanId === planId)
    .map(subsriptionOfferDetails => {
      return {
        sku: productId,
        offerToken: subsriptionOfferDetails.offerToken,
        basePlanId: subsriptionOfferDetails.basePlanId
      }
    })

  if (offers.length === 0) {
    throw new Error(`No base plan found for ${planId}`)
  }

  log.debug('Found subscription offer', offers)
  return offers
}

const isUserCanceledError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'E_USER_CANCELLED'
  )
}

const extractBaseCozyDomain = (client: CozyClient): string => {
  const cozyUrl = client.getStackClient().uri
  const cozyDomain = new URL(cozyUrl).hostname
  const baseDomain = cozyDomain.split('.').slice(1).join('.')

  return baseDomain
}

const parseProrationMode = (
  prorationMode: string | null
): ProrationModesAndroid | undefined => {
  if (!prorationMode) {
    return undefined
  }

  switch (prorationMode) {
    case 'DEFERRED': {
      return ProrationModesAndroid.DEFERRED
    }
    case 'CHARGE_PRORATED_PRICE': {
      return ProrationModesAndroid.IMMEDIATE_AND_CHARGE_PRORATED_PRICE
    }
    default: {
      throw new Error(`Unknown prorationMode ${prorationMode}`)
    }
  }
}

export const formatOffers = (subscriptions: Subscription[]): string => {
  const result = subscriptions.flatMap(subscription => {
    if (subscription.platform === 'ios') {
      return [
        {
          productId: subscription.productId,
          title: subscription.title,
          subscriptionPeriod:
            subscription.subscriptionPeriodUnitIOS?.toString() ?? '',
          currency: subscription.currency,
          price: subscription.price,
          localizedPrice: subscription.localizedPrice
        }
      ]
    } else if (subscription.platform === 'android') {
      return subscription.subscriptionOfferDetails.map(offerDetails => {
        const pricingPhase = offerDetails.pricingPhases.pricingPhaseList[0]
        return {
          productId: subscription.productId,
          title: subscription.name,
          subscriptionPeriod: parseAndroidBillingPeriod(
            pricingPhase.billingPeriod as AndroidBillingPeriodEnum
          ),
          basePlanId: offerDetails.basePlanId,
          currency: pricingPhase.priceCurrencyCode,
          price: pricingPhase.priceAmountMicros,
          localizedPrice: pricingPhase.formattedPrice
        }
      })
    }
    return []
  })

  return JSON.stringify(result)
}

type AndroidBillingPeriodEnum = 'P1W' | 'P1M' | 'P1Y'

const parseAndroidBillingPeriod = (
  billingPeriod: AndroidBillingPeriodEnum
): string => {
  const map = {
    P1W: 'WEEK',
    P1M: 'MONTH',
    P1Y: 'YEAR'
  }

  return map[billingPeriod]
}
