import { EventEmitter } from 'events'
import { Platform, StatusBar } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'

import Minilog from '@cozy/minilog'

import { internalMethods } from '/libs/intents/localMethods'
import { urlHasConnectorOpen } from '/libs/functions/urlHasConnector'

const log = Minilog('SET_FLAGSHIP_UI')

const UI_DARK = 'dark-content'
const UI_LIGHT = 'light-content'

const isDarkMode = bottomTheme => bottomTheme === UI_LIGHT

const shouldUpdateNavbar = bottomTheme =>
  bottomTheme && changeBarColors(isDarkMode(bottomTheme))

const handleSideEffects = ({ bottomTheme, ...parsedIntent }) => {
  flagshipUI.emit('change', parsedIntent)

  shouldUpdateNavbar(bottomTheme)
}

const formatTheme = position =>
  position && position.includes?.('light')
    ? UI_LIGHT
    : position?.includes?.('dark')
    ? UI_DARK
    : undefined

const handleLogging = (intent, name) => log.info(`by ${name}`, intent)

export const resetUIState = uri => {
  const bottomTheme = urlHasConnectorOpen(uri) ? UI_DARK : UI_LIGHT

  StatusBar.setBarStyle(bottomTheme)

  internalMethods.setFlagshipUI({ bottomTheme })

  Platform.OS === 'android' && StatusBar?.setBackgroundColor('transparent')
}

export const flagshipUI = new EventEmitter()

export const setFlagshipUI = (intent, callerName) => {
  callerName && handleLogging(intent, callerName)

  return handleSideEffects(
    Object.fromEntries(
      Object.entries({
        ...intent,
        bottomTheme: formatTheme(intent.bottomTheme),
        topTheme: formatTheme(intent.topTheme)
      })
        .filter(([, v]) => v)
        .map(([k, v]) => [k, v.trim()])
    )
  )
}
