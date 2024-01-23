import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { initConnection, useIAP } from 'react-native-iap'
import { getLocales } from 'react-native-localize'
import Toast from 'react-native-toast-message'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import { useClient, useInstanceInfo } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  CLOUDERY_OFFER,
  interceptNavigation,
  clouderyOfferEventHandler,
  buySubscription,
  formatOffers
} from '/app/domain/iap/services/clouderyOffer'
import { getErrorMessage } from '/libs/functions/getErrorMessage'
import { t } from '/locales/i18n'

const log = Minilog('💳 Cloudery Offer')

const IOS_OFFERS = [
  'price_2024_standard_monthly_01',
  'price_2024_premium_monthly_01'
]
const ANDROID_OFFERS = ['2024_standard_01', '2024_premium_01']
const SKUS = Platform.OS === 'ios' ? IOS_OFFERS : ANDROID_OFFERS

interface BuyingStateIDLE {
  state: 'IDLE'
}
interface BuyingStateBuying {
  state: 'BUYING'
  productId: string
  planId: string | null
  purchaseToken: string | null
  prorationMode: string | null
}
interface BuyingStateError {
  state: 'ERROR'
  productId: string
  planId: string | null
  purchaseToken: string | null
  prorationMode: string | null
}
interface BuyingStateSuccess {
  state: 'SUCCESS'
}

export type BuyingState =
  | BuyingStateIDLE
  | BuyingStateBuying
  | BuyingStateError
  | BuyingStateSuccess

interface ClouderyOfferState {
  hidePopup: () => void
  popupUrl: string | null
  instanceInfoLoaded: boolean
  interceptNavigation: (request: WebViewNavigation) => boolean
  retryBuySubscription: () => void
  buyingState: BuyingState
  setBuyingState: Dispatch<SetStateAction<BuyingState>>
  backToOffers: () => void
}

export const useClouderyOffer = (): ClouderyOfferState => {
  const client = useClient()
  const instancesInfo = useInstanceInfo()
  const { subscriptions, getSubscriptions } = useIAP()

  const [partialPopupUrl, setPartialPopupUrl] = useState<string | null>(null)
  const [popupUrl, setPopupUrl] = useState<string | null>(null)
  const [buyingState, setBuyingState] = useState<BuyingState>({
    state: 'IDLE'
  })

  const subscribed = (): void => {
    setBuyingState({
      state: 'SUCCESS'
    })
  }

  const hidePopup = (): void => {
    setPopupUrl(null)
    setBuyingState({
      state: 'IDLE'
    })
  }

  useEffect(() => {
    const eventCallback = (href: string): void => {
      if (client === null) {
        log.error('Client is null, should not happen')
        return
      }

      const doAsync = async (): Promise<void> => {
        try {
          await initConnection()
          await getSubscriptions({ skus: SKUS })
          setPartialPopupUrl(current => current ?? href)
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error)
          log.error(
            `Error while initializing ClouderyOffer popup's url: ${errorMessage}`
          )
          Toast.show({
            text1: t('screens.clouderyOffer.error.title'),
            type: 'error'
          })
        }
      }

      void doAsync()
    }

    const subscription = clouderyOfferEventHandler.addListener(
      CLOUDERY_OFFER,
      eventCallback
    )

    return (): void => {
      subscription.removeListener(CLOUDERY_OFFER, eventCallback)
    }
  }, [client, getSubscriptions])

  useEffect(() => {
    if (!partialPopupUrl) {
      setPopupUrl(null)
    } else {
      const offersParam = formatOffers(subscriptions)
      const lang = getLocales()[0].languageCode

      const url = new URL(partialPopupUrl)
      url.searchParams.append('iap_offers', offersParam)
      url.searchParams.append('lang', lang)

      setPopupUrl(url.toString())
    }
  }, [partialPopupUrl, subscriptions])

  useEffect(
    function logSubscriptions() {
      log.debug(`Subscriptions from store = ${JSON.stringify(subscriptions)}`)
    },
    [subscriptions]
  )

  const retryBuySubscription = (): void => {
    if (buyingState.state !== 'ERROR') {
      log.error('Buying state is not errored, should not happen')
      return
    }

    void buySubscription(
      client,
      buyingState.productId,
      buyingState.planId,
      buyingState.purchaseToken,
      buyingState.prorationMode,
      instancesInfo,
      subscriptions,
      setBuyingState,
      subscribed
    )
  }

  const backToOffers = (): void => {
    if (buyingState.state !== 'ERROR') {
      log.error('Buying state is not errored, should not happen')
      return
    }

    setBuyingState({
      state: 'IDLE'
    })
  }

  return {
    hidePopup,
    popupUrl,
    instanceInfoLoaded: instancesInfo.isLoaded,
    interceptNavigation: interceptNavigation(
      client,
      instancesInfo,
      subscriptions,
      setBuyingState,
      subscribed
    ),
    retryBuySubscription,
    buyingState,
    setBuyingState,
    backToOffers
  }
}
