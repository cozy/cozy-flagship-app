import RNBootSplash, { VisibilityStatus } from 'react-native-bootsplash'

import { flagshipUIEventHandler, flagshipUIEvents } from '/app/view/FlagshipUI'
import { devlog } from '/core/tools/env'

export const splashScreens = {
  LOCK_SCREEN: 'LOCK_SCREEN'
} as const
export type SplashScreenEnum = keyof typeof splashScreens

export class SplashScreenService {
  show = showSplashScreen
  hide = hideSplashScreen
}

export const showSplashScreen = (
  bootsplashName?: SplashScreenEnum
): Promise<void> => {
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

export const hideSplashScreen = (
  bootsplashName?: SplashScreenEnum
): Promise<void> => {
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
