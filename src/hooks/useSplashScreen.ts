import { useContext, useEffect } from 'react'
import { AppState } from 'react-native'

import { hideSplashScreen } from '/app/theme/SplashScreenService'
import { SplashScreenContext } from '/libs/contexts/SplashScreenContext'
import { safePromise } from '/utils/safePromise'

export const useSplashScreen = (): {
  hideSplashScreen: () => Promise<void>
  showSplashScreen: () => Promise<void>
} => ({
  hideSplashScreen: useContext(SplashScreenContext).hide,
  showSplashScreen: useContext(SplashScreenContext).show
})

export const useSecureBackgroundSplashScreen = (): void => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        safePromise(hideSplashScreen)('secure_background')
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])
}
