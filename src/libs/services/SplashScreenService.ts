import RNBootSplash from 'react-native-bootsplash'

import { devlog } from '/core/tools/env'

export class SplashScreenService {
  show = showSplashScreen
  hide = hideSplashScreen
}

export const showSplashScreen = (): Promise<void> => {
  devlog('☁️ showSplashScreen called')
  return RNBootSplash.show({ fade: true })
}
export const hideSplashScreen = (): Promise<void> => {
  devlog('☁️ hideSplashScreen called')
  return RNBootSplash.hide({ fade: true })
}
