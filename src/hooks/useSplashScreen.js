import {useContext} from 'react'
import {SplashScreenContext} from '../libs/contexts/SplashScreenContext'

export const useSplashScreen = () => ({
  hideSplashScreen: useContext(SplashScreenContext).hide,
  showSplashScreen: useContext(SplashScreenContext).show,
})
