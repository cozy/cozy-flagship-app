import { EventEmitter } from 'events'
import { Platform, StatusBar } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'

import Minilog from '@cozy/minilog'
import { FlagshipUI } from 'cozy-intent'

import { urlHasConnectorOpen } from '/libs/functions/urlHasConnector'

const log = Minilog('SET_FLAGSHIP_UI')

interface NormalisedFlagshipUI
  extends Omit<FlagshipUI, 'bottomTheme' | 'topTheme'> {
  bottomTheme?: UI_THEME
  topTheme?: UI_THEME
}

type UI_THEME = typeof UI_DARK | typeof UI_LIGHT

const UI_DARK = 'dark-content'

const UI_LIGHT = 'light-content'

const isDarkMode = (bottomTheme: UI_THEME): boolean => bottomTheme === UI_LIGHT

const updateStatusBarAndBottomBar = (bottomTheme?: UI_THEME): void => {
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

const formatTheme = (position?: string): UI_THEME | undefined =>
  position && position.includes?.('light')
    ? UI_LIGHT
    : position?.includes?.('dark')
    ? UI_DARK
    : undefined

const handleLogging = (intent: FlagshipUI, name: string): void =>
  log.info(`by ${name}`, intent)

export const flagshipUI = new EventEmitter()

export const setFlagshipUI = (
  intent: FlagshipUI,
  callerName?: string
): void => {
  callerName && handleLogging(intent, callerName)

  return handleSideEffects(
    Object.fromEntries(
      Object.entries({
        ...intent,
        bottomTheme: formatTheme(intent.bottomTheme),
        topTheme: formatTheme(intent.topTheme)
      })
        .filter(([, v]) => v)
        .map(([k, v]) => [k, v?.trim()])
    )
  )
}

export const resetUIState = (
  uri: string,
  // eslint-disable-next-line no-unused-vars
  callback?: (theme: UI_THEME) => void
): void => {
  const theme = urlHasConnectorOpen(uri) ? 'dark' : 'light'

  setFlagshipUI({ bottomTheme: theme, topTheme: theme }, 'resetUIState')

  callback?.(theme === 'dark' ? UI_DARK : UI_LIGHT)

  Platform.OS === 'android' && StatusBar?.setBackgroundColor('transparent')
}
