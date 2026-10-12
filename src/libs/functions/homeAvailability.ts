import { EventEmitter } from 'events'

import { useEffect, useState } from 'react'

const HOME_UNAVAILABLE = 'HOME_UNAVAILABLE'

let homeUnavailable = false

const homeAvailabilityEventHandler = new EventEmitter()

export const markHomeUnavailable = (): void => {
  if (homeUnavailable) return

  homeUnavailable = true
  homeAvailabilityEventHandler.emit(HOME_UNAVAILABLE)
}

export const isHomeUnavailable = (): boolean => homeUnavailable

export const useIsHomeUnavailable = (): boolean => {
  const [unavailable, setUnavailable] = useState(isHomeUnavailable)

  useEffect(() => {
    setUnavailable(isHomeUnavailable())

    const handleHomeUnavailable = (): void => {
      setUnavailable(true)
    }

    homeAvailabilityEventHandler.on(HOME_UNAVAILABLE, handleHomeUnavailable)

    return () => {
      homeAvailabilityEventHandler.off(HOME_UNAVAILABLE, handleHomeUnavailable)
    }
  }, [])

  return unavailable
}
