import RNBootSplash from 'react-native-bootsplash'

export class SplashScreenService {
  show = showSplashScreen
  hide = hideSplashScreen
}

export const showSplashScreen = (): Promise<void> =>
  RNBootSplash.show({ fade: true })
export const hideSplashScreen = (): Promise<void> =>
  RNBootSplash.hide({ fade: true })
