import RNBootSplash, { VisibilityStatus } from 'react-native-bootsplash'

import { flagshipUIEventHandler, flagshipUIEvents } from '/app/view/FlagshipUI'
import { devlog } from '/core/tools/env'

export class SplashScreenService {
  show = showSplashScreen
  hide = hideSplashScreen
}

export const showSplashScreen = (bootsplashName?: string): Promise<void> => {
  devlog('☁️ showSplashScreen called')

  flagshipUIEventHandler.emit(
    flagshipUIEvents.SET_COMPONENT_COLORS,
    `Splashscreen`,
    {
      topTheme: 'light',
      bottomTheme: 'light'
    }
  )

  return RNBootSplash.show({ fade: true, bootsplashName })
}

export const hideSplashScreen = (bootsplashName?: string): Promise<void> => {
  flagshipUIEventHandler.emit(
    flagshipUIEvents.SET_COMPONENT_COLORS,
    `Splashscreen`,
    undefined
  )

  return RNBootSplash.hide({ fade: true, bootsplashName })
}

export const getSplashScreenStatus = (): Promise<VisibilityStatus> => {
  return RNBootSplash.getVisibilityStatus()
}
