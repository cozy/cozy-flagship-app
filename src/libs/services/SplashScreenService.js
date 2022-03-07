import RNBootSplash from 'react-native-bootsplash'

export class SplashScreenService {
  hide = hideSplashScreen
}

export const hideSplashScreen = () => RNBootSplash.hide({fade: true})
