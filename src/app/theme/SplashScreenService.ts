import RNBootSplash, { VisibilityStatus } from 'react-native-bootsplash'

import { flagshipUIEventHandler, flagshipUIEvents } from '/app/view/FlagshipUI'
import { resetUIState } from '/libs/intents/setFlagshipUI'
import { navigationRef } from '/libs/RootNavigation'
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

export const hideSplashScreen = (
  bootsplashName?: string,
  override?: boolean
): Promise<void> => {
  // On the default page (home), we want to reset the UI state at first render
  // so we get correct OS theme and status bar color
  const isDefaultRoute =
    navigationRef.current?.getCurrentRoute()?.name === 'default'

  if (isDefaultRoute) {
    devlog('☁️ hideSplashScreen called with default route, resetting UI')
    // We don't care about the URI in this case, we don't want to check if a konnector is open
    if (!override) resetUIState('')
  } else {
    devlog('☁️ hideSplashScreen called with non-default route')
  }

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
