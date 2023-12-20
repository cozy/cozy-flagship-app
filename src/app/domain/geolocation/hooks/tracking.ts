import { useEffect } from 'react'

import { useClient } from 'cozy-client'
import Minilog from 'cozy-minilog'

import {
  isGeolocationTrackingEnabled,
  getShouldStartTracking,
  setGeolocationTracking
} from '/app/domain/geolocation/services/tracking'
import { isGeolocationQuotaExceeded } from '/app/domain/geolocation/helpers/quota'

const log = Minilog('📍 Geolocation')

export const useGeolocationTracking = (): void => {
  const client = useClient()

  useEffect(() => {
    const initializeTracking = async (): Promise<void> => {
      if (!client) return

      const trackingEnabled = await isGeolocationTrackingEnabled()

      if (trackingEnabled) {
        const quotaExceeded = await isGeolocationQuotaExceeded(client)

        if (quotaExceeded) {
          log.debug('Geolocation quota exceeded')
          await setGeolocationTracking(false)
          return
        }
      } else {
        const shouldStartTracking = (await getShouldStartTracking()) as boolean

        if (shouldStartTracking) {
          log.debug('Restarting geolocation tracking')
          await setGeolocationTracking(true)
          return
        }
      }
    }

    void initializeTracking()
  }, [client])
}
