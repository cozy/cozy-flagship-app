import { changeBarColors } from 'react-native-immersive-bars'
import { EventEmitter } from 'events'

import Minilog from '@cozy/minilog'

const log = Minilog('SET_FLAGSHIP_UI')

const handleSideEffects = ({ bottomTheme, ...parsedIntent }) => {
  const shouldCallBarApi = bottomTheme === 'light' || bottomTheme === 'dark'

  shouldCallBarApi && changeBarColors(bottomTheme === 'light')

  flagshipUI.emit('change', parsedIntent)
}

const handleLogging = (intent, name) => log.info(`by ${name}`, intent)

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
