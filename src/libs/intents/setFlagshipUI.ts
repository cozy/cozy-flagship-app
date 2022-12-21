import { EventEmitter } from 'events'
import { Platform, StatusBar } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'

import Minilog from '@cozy/minilog'
import { FlagshipUI } from 'cozy-intent'

import { urlHasConnectorOpen } from '/libs/functions/urlHasConnector'

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

  if (topTheme && topTheme !== bottomTheme)
    return StatusBar.setBarStyle(topTheme)

  if (lastTopTheme && lastTopTheme !== bottomTheme)
    return StatusBar.setBarStyle(lastTopTheme)
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

export const formatTheme = (
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
        bottomTheme: formatTheme(intent.bottomTheme as ThemeInput),
        topTheme: formatTheme(intent.topTheme as ThemeInput)
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
  const theme = urlHasConnectorOpen(uri) ? ThemeInput.Dark : ThemeInput.Light

  void setFlagshipUI({ bottomTheme: theme, topTheme: theme }, 'resetUIState')

  callback?.(
    theme === ThemeInput.Dark ? StatusBarStyle.Dark : StatusBarStyle.Light
  )

  Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent')
}
