import { EventEmitter } from 'events'

import Minilog from '@cozy/minilog'
import { Platform, StatusBar } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'

import { FlagshipUI } from 'cozy-intent'

import { urlHasKonnectorOpen } from '/libs/functions/urlHasKonnector'
import {
  getHomeThemeAsStatusBarStyle,
  getHomeThemeAsThemeInput,
  themeLog
} from '/app/theme/themeManager'
import { navigationRef } from '/libs/RootNavigation'
import { routes } from '/constants/routes'

const log = Minilog('SET_FLAGSHIP_UI')

const isDarkMode = (bottomTheme: StatusBarStyle): boolean =>
  bottomTheme === StatusBarStyle.Light

const handleLogging = (intent: FlagshipUI, name: string): void =>
  log.info(`by ${name}`, intent)
export interface NormalisedFlagshipUI
  extends Omit<FlagshipUI, 'bottomTheme' | 'topTheme'> {
  bottomTheme?: StatusBarStyle
  topTheme?: StatusBarStyle
}

export enum ThemeInput {
  Dark = 'dark',
  Light = 'light'
}

export enum StatusBarStyle {
  Dark = 'dark-content',
  Light = 'light-content',
  Default = 'default'
}

class Ui {
  private _state: NormalisedFlagshipUI

  constructor(initialState: NormalisedFlagshipUI) {
    this._state = initialState
  }

  public get state(): NormalisedFlagshipUI {
    return this._state
  }

  public set state(newState: NormalisedFlagshipUI) {
    this._state = newState
  }
}

const ui = new Ui({ topTheme: StatusBarStyle.Light })

const shouldRepaintStatusBar = (
  bottomTheme?: StatusBarStyle,
  topTheme?: StatusBarStyle
): void => {
  const lastTopTheme = ui.state.topTheme

  /**
   * If the topTheme is defined, we should update the StatusBar
   * even if it's not strictly necessary because changeBarColors() already did it.
   */
  if (topTheme) return StatusBar.setBarStyle(topTheme)

  /**
   * If the event does not have a topTheme, we should compare the last topTheme
   * with the bottomTheme. If they are different, we want to override the
   * changeBarColors() behavior and set the StatusBar to the last topTheme.
   */
  if (lastTopTheme !== bottomTheme)
    StatusBar.setBarStyle(lastTopTheme ?? 'default')
}

const handleSideEffects = ({
  bottomTheme,
  ...parsedIntent
}: NormalisedFlagshipUI): void => {
  flagshipUI.emit('change', parsedIntent)
  updateStatusBarAndBottomBar(bottomTheme, parsedIntent.topTheme)

  ui.state = { bottomTheme, ...parsedIntent }
}

export const updateStatusBarAndBottomBar = (
  bottomTheme?: StatusBarStyle,
  topTheme?: StatusBarStyle
): void => {
  if (Platform.OS === 'android') {
    bottomTheme && changeBarColors(isDarkMode(bottomTheme))

    // ChangeBarColors() change both StatusBar and NavigationBar
    // so we need to check if we need to change the StatusBar
    // if the StatusBar should be different from the NavigationBar.
    shouldRepaintStatusBar(bottomTheme, topTheme)
  } else {
    // On iOS we don't have BottomBar so we only need to
    // change the BarStyle.
    bottomTheme && StatusBar.setBarStyle(bottomTheme)
  }
}

const ON_OPEN_UNMOUNT = 'onOpenUnmount'
const FULLSCREEN = 'fullScreen'
const IMMERSIVE = 'immersive'

export const formatTheme = (
  key: keyof Partial<FlagshipUI>,
  input?: ThemeInput,
  callerName?: string
): StatusBarStyle | undefined => {
  const currentRouteName = navigationRef.current?.getCurrentRoute()?.name

  // Check if the current route name is 'default' (home)
  if (currentRouteName === routes.default) {
    return formatBasedOnGlobalTheme(key, input, callerName)
  }

  // If the current route name is not 'default', or there's no global theme set, use the input
  return formatBasedOnInput(input)
}

/**
 * Format theme based on global theme settings.
 * @param key - Theme key ('bottomTheme' or 'topTheme')
 * @param input - The ThemeInput value
 * @param callerName - The caller name, used to determine specific behaviors
 */
const formatBasedOnGlobalTheme = (
  key: keyof Partial<FlagshipUI>,
  input?: ThemeInput,
  callerName?: string
): StatusBarStyle | undefined => {
  const homeTheme = getHomeThemeAsStatusBarStyle()

  /**
   * If the caller is onOpenUnmount (meaning a closing dialog),
   * and the dialog was fullscreen and or immersive,
   * we want to use the home theme instead of the input.
   */
  if (
    callerName?.includes(ON_OPEN_UNMOUNT) &&
    (callerName.includes(FULLSCREEN) || callerName.includes(IMMERSIVE))
  ) {
    themeLog.info(
      `formatBasedOnGlobalTheme uses home theme "${homeTheme}" for ${key} instead of "${String(
        input
      )}" because of callerName "${callerName}"`
    )

    return homeTheme
  }

  return input ? formatBasedOnInput(input) : homeTheme
}

/**
 * Format theme based on input.
 * @param input - The ThemeInput value
 */
const formatBasedOnInput = (
  input?: ThemeInput | string
): StatusBarStyle | undefined =>
  input?.includes(ThemeInput.Light)
    ? StatusBarStyle.Light
    : input?.includes(ThemeInput.Dark)
    ? StatusBarStyle.Dark
    : undefined

export const flagshipUI = new EventEmitter()

export const setFlagshipUI = (
  intent: FlagshipUI,
  callerName?: string
): Promise<null> => {
  callerName && handleLogging(intent, callerName)

  handleSideEffects(
    Object.fromEntries(
      Object.entries({
        ...intent,
        bottomTheme: formatTheme(
          'bottomTheme',
          intent.bottomTheme as ThemeInput,
          callerName
        ),
        topTheme: formatTheme(
          'topTheme',
          intent.topTheme as ThemeInput,
          callerName
        )
      })
        .filter(([, v]) => v)
        .map(([k, v]) => [k, v?.trim()])
    )
  )

  return Promise.resolve(null)
}

export const resetUIState = (
  uri: string,
  callback?: (theme: StatusBarStyle) => void
): void => {
  const theme = urlHasKonnectorOpen(uri)
    ? ThemeInput.Dark
    : getHomeThemeAsThemeInput()

  themeLog.info('resetUIState', { uri, theme })

  void setFlagshipUI({ bottomTheme: theme, topTheme: theme }, 'resetUIState')

  callback?.(
    theme === ThemeInput.Dark ? StatusBarStyle.Dark : StatusBarStyle.Light
  )

  Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent')
}
