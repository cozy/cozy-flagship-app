import { useEffect } from 'react'

import { useClient, useQuery } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  isGeolocationTrackingEnabled,
  checkShouldStartTracking
} from '/app/domain/geolocation/services/tracking'
import { checkGeolocationQuota } from '/app/domain/geolocation/helpers/quota'
import { GeolocationTrackingEmitter } from '/app/domain/geolocation/tracking/events'
import {
  FETCH_OPENPATH_TRIPS_SERVICE_NAME,
  TRIP_END
} from '/app/domain/geolocation/tracking/consts'
import { buildServiceWebhookQuery } from '/app/domain/geolocation/helpers/index'
import { storeFetchServiceWebHook } from '/app/domain/geolocation/tracking'
const log = Minilog('📍 Geolocation')

interface WebhookTrigger {
  message: {
    name: string
  }
  links?: {
    webhook?: string
  }
}

export const useGeolocationTracking = (): void => {
  const client = useClient()

  useEffect(() => {
    if (!client) return

    const onTripEnd = (): void => {
      log.debug('Trip end event received, checking quota')
      void checkGeolocationQuota(client)
    }

    GeolocationTrackingEmitter.on(TRIP_END, onTripEnd)

    return () => {
      GeolocationTrackingEmitter.off(TRIP_END, onTripEnd)
    }
  }, [client])

  useEffect(() => {
    const initializeTracking = async (): Promise<void> => {
      if (!client) return

      const trackingEnabled = await isGeolocationTrackingEnabled()

      if (trackingEnabled) {
        await checkGeolocationQuota(client)
      } else {
        await checkShouldStartTracking()
      }
    }

    void initializeTracking()
  }, [client])

  const webhookQuery = buildServiceWebhookQuery()
  const webhookResp = useQuery(webhookQuery.definition, webhookQuery.options)

  if (Array.isArray(webhookResp.data) && webhookResp.data.length > 0) {
    const data = webhookResp.data as WebhookTrigger[]

    const openpathServiceWebHook = data.find(
      trigger => trigger.message.name === FETCH_OPENPATH_TRIPS_SERVICE_NAME
    )
    const webhook = openpathServiceWebHook?.links?.webhook
    if (webhook) {
      void storeFetchServiceWebHook(webhook)
    }
  }
}
