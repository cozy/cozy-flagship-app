import React, { ReactNode } from 'react'
import { SplashScreenService } from '/libs/services/SplashScreenService'
import { SplashScreenContext } from '/libs/contexts/SplashScreenContext'

export const SplashScreenProvider = (props: {
  children: ReactNode
}): JSX.Element => (
  <SplashScreenContext.Provider value={new SplashScreenService()}>
    {props.children}
  </SplashScreenContext.Provider>
)
