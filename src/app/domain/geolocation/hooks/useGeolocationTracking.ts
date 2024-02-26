import { useEffect } from 'react'

import { useClient } from 'cozy-client'

import {
  isGeolocationTrackingEnabled,
  checkShouldStartTracking,
  initGeolocationTracking
} from '/app/domain/geolocation/services/tracking'
import { checkGeolocationQuota } from '/app/domain/geolocation/helpers/quota'
import { fetchAndStoreWebhook } from '/app/domain/geolocation/helpers/webhook'

export const useGeolocationTracking = (): void => {
  const client = useClient()

  useEffect(() => {
    // Init tracking only once: https://transistorsoft.github.io/react-native-background-geolocation/classes/backgroundgeolocation.html#ready
    // Note it does not start tracking itself
    void initGeolocationTracking()
  }, [])

  useEffect(() => {
    const checkTracking = async (): Promise<void> => {
      if (!client) return

      const trackingEnabled = await isGeolocationTrackingEnabled()
      if (trackingEnabled) {
        await checkGeolocationQuota(client)
      } else {
        await checkShouldStartTracking()
      }
    }

    void checkTracking()
  }, [client])

  useEffect(() => {
    const initializeWebhook = async (): Promise<void> => {
      if (!client) return

      await fetchAndStoreWebhook(client)
    }

    void initializeWebhook()
  }, [client])
}
