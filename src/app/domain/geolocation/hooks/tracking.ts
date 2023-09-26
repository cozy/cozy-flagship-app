import { useEffect } from 'react'

import { useClient } from 'cozy-client'

import {
  getShouldStartTracking,
  setGeolocationTracking
} from '/app/domain/geolocation/services/tracking'

export const useGeolocationTracking = (): void => {
  const client = useClient()

  useEffect(() => {
    const initializeTracking = async (): Promise<void> => {
      if (!client) return

      const shouldStartTracking = (await getShouldStartTracking()) as boolean

      if (shouldStartTracking) {
        await setGeolocationTracking(true)
      }
    }

    void initializeTracking()
  }, [client])
}
