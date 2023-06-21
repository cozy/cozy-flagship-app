import React from 'react'

import { SplashScreenService } from '/app/theme/SplashScreenService'

export const SplashScreenContext = React.createContext<SplashScreenService>(
  {} as SplashScreenService
)
