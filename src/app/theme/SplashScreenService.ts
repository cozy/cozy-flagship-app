import { AppState } from 'react-native'
import RNBootSplash, { VisibilityStatus } from 'react-native-bootsplash'

import Minilog from 'cozy-minilog'

import { flagshipUIEventHandler, flagshipUIEvents } from '/app/view/FlagshipUI'
import { logToSentry } from '/libs/monitoring/Sentry'
import config from '/app/theme/config.json'

const splashScreenLogger = Minilog('☁️ SplashScreen')

export const splashScreens = {
  LOCK_SCREEN: 'LOCK_SCREEN',
  SECURE_BACKGROUND: 'secure_background', // this mirrors native declaration
  GLOBAL: 'global'
} as const

type SplashScreenEnumKeys = keyof typeof splashScreens
export type SplashScreenEnum = (typeof splashScreens)[SplashScreenEnumKeys]

// Using a map to handle multiple timers
const autoHideTimers: Record<string, NodeJS.Timeout | undefined> = {}

let autoHideDuration = config.autoHideDuration // Default timeout duration in milliseconds

export const setAutoHideDuration = (duration: number): void => {
  autoHideDuration = duration
}

/**
 * Retrieves the status of the splash screen ("visible" | "hidden" | "transitioning").
 * @returns A promise that resolves to the visibility status of the splash screen.
 */
export const getSplashScreenStatus = (): Promise<VisibilityStatus> => {
  return RNBootSplash.getVisibilityStatus()
}

/**
 * Shows the splash screen with the specified bootsplash name.
 * If no bootsplash name is provided, it will default to a unique identifier 'global'.
 *
 * @param bootsplashName - The name of the bootsplash.
 * @returns A promise that resolves when the splash screen is shown.
 */
export const showSplashScreen = async (
  bootsplashName: SplashScreenEnum | undefined = splashScreens.GLOBAL
): Promise<void> => {
  splashScreenLogger.debug(
    `Attempting to show splash screen "${bootsplashName}"`
  )

  flagshipUIEventHandler.emit(
    flagshipUIEvents.SET_COMPONENT_COLORS,
    `Splashscreen`,
    {
      topTheme: 'light',
      bottomTheme: 'light'
    }
  )

  setTimeoutForSplashScreen(bootsplashName)

  try {
    await RNBootSplash.show({ fade: true, bootsplashName })
    return splashScreenLogger.info(`Splash screen shown "${bootsplashName}"`)
  } catch (error) {
    splashScreenLogger.error(
      `Error showing splash screen: ${bootsplashName}`,
      error
    )
    logToSentry(error)
  }
}

/**
 * Hides the splash screen.
 *
 * @param bootsplashName - Optional name of the bootsplash.
 * @returns A promise that resolves when the splash screen is hidden.
 */
export const hideSplashScreen = async (
  bootsplashName: SplashScreenEnum | undefined = splashScreens.GLOBAL
): Promise<void> => {
  splashScreenLogger.debug(
    `Attempting to hide splash screen "${bootsplashName}"`
  )

  flagshipUIEventHandler.emit(
    flagshipUIEvents.SET_COMPONENT_COLORS,
    `Splashscreen`,
    undefined
  )

  try {
    await manageTimersAndHideSplashScreen(bootsplashName)
    return splashScreenLogger.info(`Splash screen hidden "${bootsplashName}"`)
  } catch (error) {
    splashScreenLogger.error(
      `Error hiding splash screen: ${bootsplashName}`,
      error
    )
    logToSentry(error)
  }
}

export const setTimeoutForSplashScreen = (
  bootsplashName: SplashScreenEnum | undefined = splashScreens.GLOBAL
): void => {
  if (bootsplashName === splashScreens.SECURE_BACKGROUND) {
    splashScreenLogger.info(
      `Skipping timeout for secure background "${bootsplashName}"`
    )
    return
  }

  destroyTimer(bootsplashName)

  autoHideTimers[bootsplashName] = setTimeout(() => {
    splashScreenLogger.warn(
      `Auto-hide duration reached for splash screen "${bootsplashName}"`
    )

    logToSentry(
      new Error(
        `Splashscreen reached autoHideDuration with bootsplashName "${bootsplashName}"`
      )
    )

    void manageTimersAndHideSplashScreen(bootsplashName, true)
  }, autoHideDuration)

  splashScreenLogger.debug(
    `Setting timeout with ID "${JSON.stringify(
      autoHideTimers[bootsplashName]
    )}" for splash screen "${bootsplashName}"`
  )
}

const manageTimersAndHideSplashScreen = async (
  bootsplashName: SplashScreenEnum | undefined = splashScreens.GLOBAL,
  fromTimeout = false
): Promise<void> => {
  if (bootsplashName !== splashScreens.SECURE_BACKGROUND)
    destroyTimer(bootsplashName, fromTimeout)

  try {
    await RNBootSplash.hide({ fade: true, bootsplashName })
  } catch (error) {
    splashScreenLogger.error(
      `Error managing timers and hiding splash screen "${bootsplashName}"`,
      error
    )
    logToSentry(error)
  }
}

const destroyTimer = (
  bootsplashName: SplashScreenEnum,
  fromTimeout = false
): void => {
  const timer = autoHideTimers[bootsplashName]

  if (autoHideTimers[bootsplashName]) {
    if (fromTimeout) {
      splashScreenLogger.debug(
        `Destroying existing timer with ID "${JSON.stringify(
          timer
        )}" for splash screen "${bootsplashName}" after auto-hide duration reached`
      )
    } else {
      splashScreenLogger.debug(
        `Clearing existing timer with ID "${JSON.stringify(
          timer
        )}" for splash screen "${bootsplashName}" after manual hide`
      )
    }

    clearTimeout(autoHideTimers[bootsplashName])
    Reflect.deleteProperty(autoHideTimers, bootsplashName)
  }
}

let activeTimersAtBackground: Record<string, boolean> = {}

const resetTimersOnActive = (): void => {
  splashScreenLogger.debug(
    `App is becoming active. Evaluating timers to reset...`
  )

  const timersToReset = Object.keys(activeTimersAtBackground)

  if (timersToReset.length === 0) {
    splashScreenLogger.info(`No splash screen timers to reset.`)
  } else {
    timersToReset.forEach(splashScreen => {
      if (activeTimersAtBackground[splashScreen]) {
        splashScreenLogger.info(
          `Resetting timer for splash screen "${splashScreen}"`
        )
        setTimeoutForSplashScreen(splashScreen as SplashScreenEnum)
      }
    })
  }

  // Clear the record once timers are reset
  activeTimersAtBackground = {}
}

const clearTimersOnBackground = (): void => {
  splashScreenLogger.debug(
    `App is going to background. Clearing active timers...`
  )

  Object.keys(autoHideTimers).forEach(splashScreen => {
    if (autoHideTimers[splashScreen]) {
      splashScreenLogger.info(
        `Clearing timer for splash screen "${splashScreen}". Will reset on active.`
      )
      activeTimersAtBackground[splashScreen] = true // Mark as active
      clearTimeout(autoHideTimers[splashScreen])
      Reflect.deleteProperty(autoHideTimers, splashScreen)
    }
  })
}

AppState.addEventListener('change', nextAppState => {
  if (nextAppState === 'active') {
    resetTimersOnActive()
  } else if (nextAppState === 'background') {
    clearTimersOnBackground()
  }
})
