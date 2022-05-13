import { EventEmitter } from 'events'
import { Platform, StatusBar } from 'react-native'
import { changeBarColors } from 'react-native-immersive-bars'

import Minilog from '@cozy/minilog'

import { internalMethods } from '/libs/intents/localMethods'
import { urlHasConnectorOpen } from '/libs/functions/urlHasConnector'

const log = Minilog('SET_FLAGSHIP_UI')

const handleSideEffects = ({ bottomTheme, ...parsedIntent }) => {
  const shouldCallBarApi = bottomTheme === 'light' || bottomTheme === 'dark'

  shouldCallBarApi && changeBarColors(bottomTheme === 'light')

  flagshipUI.emit('change', parsedIntent)
}

const handleLogging = (intent, name) => log.info(`by ${name}`, intent)

export const resetUIState = uri => {
  const bottomTheme = urlHasConnectorOpen(uri)
    ? 'dark-content'
    : 'light-content'

  StatusBar.setBarStyle(bottomTheme)

  internalMethods.setFlagshipUI({ bottomTheme })

  Platform.OS !== 'ios' && StatusBar?.setBackgroundColor('transparent')
}

export const flagshipUI = new EventEmitter()

export const setFlagshipUI = (intent, callerName) => {
  callerName && handleLogging(intent, callerName)

  return handleSideEffects(
    Object.fromEntries(
      Object.entries({
        ...intent,
        topTheme:
          intent.topTheme === 'light'
            ? 'light-content'
            : intent.topTheme === 'dark'
            ? 'dark-content'
            : undefined
      })
        .filter(([, v]) => v)
        .map(([k, v]) => [k, v.trim()])
    )
  )
}
