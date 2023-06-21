import RNBootSplash from 'react-native-bootsplash'

import { resetUIState } from '/libs/intents/setFlagshipUI'
import { navigationRef } from '/libs/RootNavigation'
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
  // On the default page (home), we want to reset the UI state at first render
  // so we get correct OS theme and status bar color
  const isDefaultRoute =
    navigationRef.current?.getCurrentRoute()?.name === 'default'

  if (isDefaultRoute) {
    devlog('☁️ hideSplashScreen called with default route, resetting UI')
    // We don't care about the URI in this case, we don't want to check if a konnector is open
    resetUIState('')
  } else {
    devlog('☁️ hideSplashScreen called with non-default route')
  }

  return RNBootSplash.hide({ fade: true })
}
