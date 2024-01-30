import { useContext, useEffect } from 'react'
import { AppState } from 'react-native'

import { hideSplashScreen, splashScreens } from '/app/theme/SplashScreenService'
import { SplashScreenContext } from '/libs/contexts/SplashScreenContext'
import { safePromise } from '/utils/safePromise'

export const useSplashScreen = (): {
  hideSplashScreen: () => Promise<void>
  showSplashScreen: () => Promise<void>
} => {
  const context = useContext(SplashScreenContext)

  if (!context) {
    throw new Error(
      'useSplashScreen must be used within a SplashScreenProvider'
    )
  }

  return {
    hideSplashScreen: context.hide,
    showSplashScreen: context.show
  }
}
export const useSecureBackgroundSplashScreen = (): void => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        safePromise(hideSplashScreen)(splashScreens.SECURE_BACKGROUND)
      }
    })

    safePromise(hideSplashScreen)(splashScreens.SECURE_BACKGROUND)

    return () => {
      subscription.remove()
    }
  }, [])
}
