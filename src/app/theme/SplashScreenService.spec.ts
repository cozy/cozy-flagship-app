import RNBootSplash from 'react-native-bootsplash'

import { logToSentry } from '/libs/monitoring/Sentry'
import config from '/app/theme/config.json'
import {
  showSplashScreen,
  hideSplashScreen,
  setAutoHideDuration,
  splashScreens
} from '/app/theme/SplashScreenService'

jest.mock('react-native-bootsplash', () => ({
  show: jest.fn(() => Promise.resolve()),
  hide: jest.fn(() => Promise.resolve()),
  getVisibilityStatus: jest.fn(() => Promise.resolve('hidden'))
}))

jest.mock('/app/view/FlagshipUI', () => ({
  flagshipUIEventHandler: {
    emit: jest.fn()
  },
  flagshipUIEvents: {
    SET_COMPONENT_COLORS: 'SET_COMPONENT_COLORS'
  }
}))

jest.mock('/libs/monitoring/Sentry', () => ({
  logToSentry: jest.fn()
}))

describe('SplashScreenService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setAutoHideDuration(config.autoHideDuration)
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should show the splash screen and set auto-hide timer', () => {
    void showSplashScreen(splashScreens.LOCK_SCREEN) // Avoid blocking thread
    jest.advanceTimersByTime(config.autoHideDuration) // We reached the auto-hide duration

    // Auto-hide should have been called
    expect(RNBootSplash.hide).toHaveBeenLastCalledWith({
      bootsplashName: splashScreens.LOCK_SCREEN,
      fade: true
    })
  })

  it('should hide the splash screen and clear the timer', () => {
    void showSplashScreen(splashScreens.LOCK_SCREEN)
    void hideSplashScreen(splashScreens.LOCK_SCREEN)
    jest.advanceTimersByTime(config.autoHideDuration)

    // Auto-hide should not have been called
    expect(RNBootSplash.hide).toHaveBeenCalledTimes(1)
  })

  it('should log to Sentry if the splash screen auto-hides', () => {
    void showSplashScreen()
    jest.advanceTimersByTime(config.autoHideDuration)
    expect(logToSentry).toHaveBeenCalledWith(expect.any(Error))
  })

  it('should allow setting a custom auto-hide duration', () => {
    const newDuration = 10000
    setAutoHideDuration(newDuration)
    void showSplashScreen()
    jest.advanceTimersByTime(newDuration)

    expect(RNBootSplash.hide).toHaveBeenLastCalledWith({
      bootsplashName: undefined,
      fade: true
    })
  })
})
