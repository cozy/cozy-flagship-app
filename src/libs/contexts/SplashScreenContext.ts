import React from 'react'

import type {
  showSplashScreen,
  hideSplashScreen
} from '/app/theme/SplashScreenService'

export const SplashScreenContext = React.createContext<
  | {
      show: typeof showSplashScreen
      hide: typeof hideSplashScreen
    }
  | undefined
>(undefined)
