import RNBootSplash from 'react-native-bootsplash'

export class SplashScreenService {
  show = showSplashScreen
  hide = hideSplashScreen
}

export const showSplashScreen = () => RNBootSplash.show({fade: true})
export const hideSplashScreen = () => RNBootSplash.hide({fade: true})
