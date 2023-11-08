import { useEffect, useState } from 'react'

import { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  CLOUDERY_OFFER,
  clouderyOfferEventHandler
} from '/app/domain/iap/services/clouderyOffer'

const log = Minilog('💳 Cloudery Offer')

interface ClouderyOfferState {
  popupUrl: string | null
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
    popupUrl
  }
}
