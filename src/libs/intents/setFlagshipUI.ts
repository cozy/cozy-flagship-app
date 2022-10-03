import { EventEmitter } from 'events'
import { Platform, StatusBar } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'

import Minilog from '@cozy/minilog'
import { FlagshipUI } from 'cozy-intent'

import { urlHasConnectorOpen } from '/libs/functions/urlHasConnector'

const log = Minilog('SET_FLAGSHIP_UI')

export interface NormalisedFlagshipUI
  extends Omit<FlagshipUI, 'bottomTheme' | 'topTheme'> {
  bottomTheme?: StatusBarStyle
  topTheme?: StatusBarStyle
}

enum ThemeInput {
  Dark = 'dark',
  Light = 'light'
}

export enum StatusBarStyle {
  Dark = 'dark-content',
  Light = 'light-content',
  Default = 'default'
}

const isDarkMode = (bottomTheme: StatusBarStyle): boolean =>
  bottomTheme === StatusBarStyle.Light

const updateStatusBarAndBottomBar = (bottomTheme?: StatusBarStyle): void => {
  if (Platform.OS === 'android') {
    bottomTheme && changeBarColors(isDarkMode(bottomTheme))
  } else {
    // On iOS we don't have BottomBar so we only need to
    // change the BarStyle.
    bottomTheme && StatusBar.setBarStyle(bottomTheme)
  }
}

const handleSideEffects = ({
  bottomTheme,
  ...parsedIntent
}: NormalisedFlagshipUI): void => {
  flagshipUI.emit('change', parsedIntent)
  updateStatusBarAndBottomBar(bottomTheme)
}

const formatTheme = (input?: ThemeInput | string): StatusBarStyle | undefined =>
  input?.includes(ThemeInput.Light)
    ? StatusBarStyle.Light
    : input?.includes(ThemeInput.Dark)
    ? StatusBarStyle.Dark
    : undefined

const handleLogging = (intent: FlagshipUI, name: string): void =>
  log.info(`by ${name}`, intent)

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
