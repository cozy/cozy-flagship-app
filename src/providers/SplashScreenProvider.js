import React from 'react'
import {SplashScreenService} from '../libs/services/SplashScreenService'
import {SplashScreenContext} from '../libs/contexts/SplashScreenContext'

export const SplashScreenProvider = ({children}) => (
  <SplashScreenContext.Provider value={new SplashScreenService()}>
    {children}
  </SplashScreenContext.Provider>
)
