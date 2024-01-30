import React, { ReactNode } from 'react'

import {
  hideSplashScreen,
  showSplashScreen
} from '/app/theme/SplashScreenService'
import { SplashScreenContext } from '/libs/contexts/SplashScreenContext'

export const SplashScreenProvider = (props: {
  children: ReactNode
}): JSX.Element => (
  <SplashScreenContext.Provider
    value={{
      show: showSplashScreen,
      hide: hideSplashScreen
    }}
  >
    {props.children}
  </SplashScreenContext.Provider>
)
