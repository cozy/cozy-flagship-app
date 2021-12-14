import RNBootSplash from 'react-native-bootsplash'

export class SplashScreenService {
  hide = () => RNBootSplash.hide({fade: true})
}
