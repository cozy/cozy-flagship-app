// Import the EventEmitter class to enable an event-driven approach.
// We use events to allow different parts of the application to react to theme changes
// in a decoupled way. This ensures that React components and other services
// can both respond to theme changes without tight coupling between them.
import { EventEmitter } from 'events'

import Minilog from 'cozy-minilog'

import { HomeThemeType, HomeThemeParams } from '/app/theme/models'
import { flagshipUIEventHandler, flagshipUIEvents } from '/app/view/FlagshipUI'
import { StatusBarStyle, ThemeInput } from '/libs/intents/setFlagshipUI'
import { getColorScheme } from '/app/theme/colorScheme'

const themeLog = Minilog('🎨 THEME_MANAGER')

const eventEmitter = new EventEmitter()

// The 'theme' variable holds the current theme state. It's kept in this module so
// that it's accessible both by React components and other services in a centralized manner.
let homeThemeRawValue: HomeThemeType = HomeThemeType.Inverted

/**
 * The getTheme function allows other parts of the application to retrieve
 * the current theme.
 */
export function getHomeTheme(): HomeThemeType {
  themeLog.info(`getHomeTheme: ${homeThemeRawValue}`)
  return homeThemeRawValue
}

/**
 * The setHomeTheme function is used to update the current theme. When the theme is updated,
 * it emits a 'themeChanged' event. This event-based approach allows different parts of
 * the application to respond to theme changes without having to be directly aware of
 * where and how the theme is changed.
 */
export function setHomeTheme(params: HomeThemeParams): void {
  const { homeTheme, componentId } = params

  if (homeTheme === 'inverted') {
    flagshipUIEventHandler.emit(
      flagshipUIEvents.SET_COMPONENT_COLORS,
      componentId,
      {
        topTheme:
          getColorScheme({ useUserColorScheme: true }) === 'dark'
            ? 'dark'
            : 'light',
        bottomTheme:
          getColorScheme({ useUserColorScheme: true }) === 'dark'
            ? 'dark'
            : 'light'
      }
    )
  } else {
    flagshipUIEventHandler.emit(
      flagshipUIEvents.SET_COMPONENT_COLORS,
      componentId,
      {
        topTheme:
          getColorScheme({ useUserColorScheme: true }) === 'dark'
            ? 'light'
            : 'dark',
        bottomTheme:
          getColorScheme({ useUserColorScheme: true }) === 'dark'
            ? 'light'
            : 'dark'
      }
    )
  }

  homeThemeRawValue = homeTheme
  themeLog.info(`setHomeTheme: ${homeTheme}`)
  eventEmitter.emit('themeChanged', homeTheme)
}

/**
 * The addThemeChangeListener function allows other parts of the application to register
 * listener functions that will be called whenever the theme changes. This is useful
 * for React components that need to re-render when the theme changes, or for any other
 * part of the application that needs to take action in response to a theme change.
 */
export function addHomeThemeChangeListener(
  listener: (newTheme: HomeThemeType) => void
): void {
  themeLog.info(`addHomeThemeChangeListener`)
  eventEmitter.on('themeChanged', listener)
}

/**
 * The removeThemeChangeListener function allows for cleanup by removing a previously
 * registered listener. This is important in scenarios like React components that should
 * clean up listeners when they unmount to prevent memory leaks and unintended side-effects.
 */
export function removeHomeThemeChangeListener(
  listener: (newTheme: HomeThemeType) => void
): void {
  themeLog.info(`removeHomeThemeChangeListener`)
  eventEmitter.removeListener('themeChanged', listener)
}

export const getHomeThemeAsThemeInput = (): ThemeInput => {
  return homeThemeRawValue === HomeThemeType.Inverted
    ? ThemeInput.Light
    : ThemeInput.Dark
}

export const getHomeThemeAsStatusBarStyle = (): StatusBarStyle => {
  return homeThemeRawValue === HomeThemeType.Inverted
    ? StatusBarStyle.Light
    : StatusBarStyle.Dark
}
