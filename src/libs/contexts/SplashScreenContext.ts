import React from 'react'
import { SplashScreenService } from '../services/SplashScreenService'

export const SplashScreenContext = React.createContext<SplashScreenService>(
  {} as SplashScreenService
)
