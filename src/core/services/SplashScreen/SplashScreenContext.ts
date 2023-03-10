import React from 'react'

import { SplashScreenService } from './SplashScreenService'

export const SplashScreenContext = React.createContext<SplashScreenService>(
  {} as SplashScreenService
)
