import RNBootSplash, { VisibilityStatus } from 'react-native-bootsplash'

import { flagshipUIEventHandler, flagshipUIEvents } from '/app/view/FlagshipUI'
import { devlog } from '/core/tools/env'
import { logToSentry } from '/libs/monitoring/Sentry'
import config from '/app/theme/config.json'

export const splashScreens = {
  LOCK_SCREEN: 'LOCK_SCREEN',
  SECURE_BACKGROUND: 'secure_background' // this mirrors native declaration
} as const

type SplashScreenEnumKeys = keyof typeof splashScreens
export type SplashScreenEnum = (typeof splashScreens)[SplashScreenEnumKeys]

let autoHideTimer: NodeJS.Timeout | null = null
let autoHideDuration = config.autoHideDuration // Default timeout duration in milliseconds

export const setAutoHideDuration = (duration: number): void => {
  autoHideDuration = duration
}

/**
 * Shows the splash screen with the specified bootsplash name.
 * If no bootsplash name is provided, it will default to 'undefined'.
 *
 * @param bootsplashName - The name of the bootsplash.
 * @returns A promise that resolves when the splash screen is shown.
 */
export const showSplashScreen = (
  bootsplashName?: SplashScreenEnum
): Promise<void> => {
  devlog(`☁️ showSplashScreen called with ${bootsplashName ?? 'undefined'}`)

  flagshipUIEventHandler.emit(
    flagshipUIEvents.SET_COMPONENT_COLORS,
    `Splashscreen`,
    {
      topTheme: 'light',
      bottomTheme: 'light'
    }
  )

  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
  }

  // Auto-hide the splash screen after a certain duration
  // This mitigates the issue of the splash screen not being hidden for unforeseen reasons
  if (bootsplashName !== splashScreens.SECURE_BACKGROUND) {
    autoHideTimer = setTimeout(() => {
      hideSplashScreen(bootsplashName).catch(error => {
        devlog(`☁️ hideSplashScreen error:`, error)
      })

      logToSentry(
        new Error(
          `Splashscreen reached autoHideDuration with bootsplahName: ${
            bootsplashName ?? 'undefined'
          } and autoHideDuration: ${autoHideDuration}`
        )
      )
    }, autoHideDuration)
  }

  return RNBootSplash.show({ fade: true, bootsplashName })
}

/**
 * Hides the splash screen.
 *
 * @param bootsplashName - Optional name of the bootsplash.
 * @returns A promise that resolves when the splash screen is hidden.
 */
export const hideSplashScreen = (
  bootsplashName?: SplashScreenEnum
): Promise<void> => {
  // Clear the auto-hide timer as we don't want to hide the splash screen twice
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = null
  }

  flagshipUIEventHandler.emit(
    flagshipUIEvents.SET_COMPONENT_COLORS,
    `Splashscreen`,
    undefined
  )

  return RNBootSplash.hide({ fade: true, bootsplashName })
}

/**
 * Retrieves the status of the splash screen ("visible" | "hidden" | "transitioning").
 * @returns A promise that resolves to the visibility status of the splash screen.
 */
export const getSplashScreenStatus = (): Promise<VisibilityStatus> => {
  return RNBootSplash.getVisibilityStatus()
}
