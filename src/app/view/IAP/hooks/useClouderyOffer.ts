import { useEffect, useState } from 'react'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  CLOUDERY_OFFER,
  interceptNavigation,
  clouderyOfferEventHandler
} from '/app/domain/iap/services/clouderyOffer'

const log = Minilog('💳 Cloudery Offer')

interface ClouderyOfferState {
  popupUrl: string | null
  interceptNavigation: (request: WebViewNavigation) => boolean
}

export const useClouderyOffer = (): ClouderyOfferState => {
  const client = useClient()

  const [popupUrl, setPopupUrl] = useState<string | null>(null)

  useEffect(() => {
    const eventCallback = (href: string): void => {
      if (client === null) {
        log.error('Client is null, should not happen')
        return
      }

      setPopupUrl(current => current ?? href)
    }

    const subscription = clouderyOfferEventHandler.addListener(
      CLOUDERY_OFFER,
      eventCallback
    )

    return (): void => {
      subscription.removeListener(CLOUDERY_OFFER, eventCallback)
    }
  }, [client])

  return {
    popupUrl,
    interceptNavigation: interceptNavigation()
  }
}
