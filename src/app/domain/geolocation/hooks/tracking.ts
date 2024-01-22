import { useEffect } from 'react'

import { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  isGeolocationTrackingEnabled,
  checkShouldStartTracking
} from '/app/domain/geolocation/services/tracking'
import { checkGeolocationQuota } from '/app/domain/geolocation/helpers/quota'
import { fetchAndStoreWebhook } from '/app/domain/geolocation/helpers/webhook'
import { GeolocationTrackingEmitter } from '/app/domain/geolocation/tracking/events'
import { TRIP_END } from '/app/domain/geolocation/tracking/consts'

const log = Minilog('📍 Geolocation')

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

  useEffect(() => {
    const initializeWebhook = async (): Promise<void> => {
      if (!client) return

      await fetchAndStoreWebhook(client)
    }

    void initializeWebhook()
  }, [client])
}
