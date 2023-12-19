import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { initConnection, useIAP } from 'react-native-iap'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import { useClient, useInstanceInfo } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  CLOUDERY_OFFER,
  interceptNavigation,
  clouderyOfferEventHandler,
  buySubscription
} from '/app/domain/iap/services/clouderyOffer'

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
  itemId: string
}
interface BuyingStateError {
  state: 'ERROR'
  itemId: string
}

export type BuyingState = BuyingStateIDLE | BuyingStateBuying | BuyingStateError

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

  const [popupUrl, setPopupUrl] = useState<string | null>(null)
  const [buyingState, setBuyingState] = useState<BuyingState>({
    state: 'IDLE'
  })

  const subscribed = (): void => {
    setPopupUrl(null)
    setBuyingState({
      state: 'IDLE'
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
        await initConnection()
        await getSubscriptions({ skus: SKUS })
        setPopupUrl(current => current ?? href)
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
      buyingState.itemId,
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
