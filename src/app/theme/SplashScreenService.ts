import { AppState } from 'react-native'
import RNBootSplash, {
  ResultStatus,
  VisibilityStatus
} from 'react-native-bootsplash'

import Minilog from 'cozy-minilog'

import rnperformance from '/app/domain/performances/measure'
import { flagshipUIEventHandler, flagshipUIEvents } from '/app/view/FlagshipUI'
import { logToSentry } from '/libs/monitoring/Sentry'
import config from '/app/theme/config.json'

const splashScreenLogger = Minilog('☁️ SplashScreen')

export const splashScreens = {
  LOCK_SCREEN: 'LOCK_SCREEN',
  SECURE_BACKGROUND: 'secure_background', // this mirrors native declaration
  SEND_LOG_EMAIL: 'SEND_LOG_EMAIL',
  GLOBAL: 'global'
} as const

type SplashScreenEnumKeys = keyof typeof splashScreens
export type SplashScreenEnum = (typeof splashScreens)[SplashScreenEnumKeys]

// Using a map to handle multiple timers
const autoHideTimers = {} as Record<
  SplashScreenEnum | string,
  NodeJS.Timeout | undefined
>

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
    rnperformance.mark(`Show SplashScreen ${bootsplashName}`)
    const result = await RNBootSplash.show({ fade: true, bootsplashName })
    splashScreenLogger.info(
      `Splash screen shown "${bootsplashName}" (${result.toString()})`
    )
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
    const result = await manageTimersAndHideSplashScreen(bootsplashName)
    splashScreenLogger.info(
      `Splash screen hidden "${bootsplashName}" (${result.toString()})`
    )
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
): Promise<ResultStatus> => {
  if (bootsplashName !== splashScreens.SECURE_BACKGROUND)
    destroyTimer(bootsplashName, fromTimeout)

  try {
    rnperformance.mark(`Hide SplashScreen ${bootsplashName}`)
    return await RNBootSplash.hide({ fade: true, bootsplashName })
  } catch (error) {
    splashScreenLogger.error(
      `Error managing timers and hiding splash screen "${bootsplashName}"`,
      error
    )
    logToSentry(error)
    return false
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

let activeTimersAtBackground: SplashScreenEnum[] = []

const resetTimersOnActive = (): void => {
  splashScreenLogger.debug(
    `App is becoming active. Evaluating timers to reset...`
  )

  if (activeTimersAtBackground.length === 0) {
    splashScreenLogger.info(`No splash screen timers to reset.`)
  } else {
    activeTimersAtBackground.forEach(splashScreen => {
      splashScreenLogger.info(
        `Resetting timer for splash screen "${splashScreen}"`
      )
      setTimeoutForSplashScreen(splashScreen)
    })
  }

  // Clear the record once timers are reset
  activeTimersAtBackground = []
}

const clearTimersOnBackground = (): void => {
  splashScreenLogger.debug(
    `App is going to background. Clearing active timers...`
  )

  const activeTimers = Object.keys(autoHideTimers) as SplashScreenEnum[]

  activeTimers.forEach(splashScreen => {
    splashScreenLogger.info(
      `Clearing timer for splash screen "${splashScreen}". Will reset on active.`
    )

    activeTimersAtBackground.push(splashScreen)

    destroyTimer(splashScreen)
  })
}

AppState.addEventListener('change', nextAppState => {
  if (nextAppState === 'active') {
    resetTimersOnActive()
  } else if (nextAppState === 'background') {
    clearTimersOnBackground()
  }
})
