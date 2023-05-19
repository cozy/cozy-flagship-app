import { EventEmitter } from 'events'

import { FlagshipUI } from 'cozy-intent'

import {
  NormalisedFlagshipUI,
  ThemeInput,
  formatTheme,
  updateStatusBarAndBottomBar
} from '/libs/intents/setFlagshipUI'

const handleSideEffects = ({
  bottomTheme,
  ...parsedIntent
}: NormalisedFlagshipUI): void => {
  lockScreenUi.emit('lockscreen:change', parsedIntent)
  updateStatusBarAndBottomBar(bottomTheme)
}

export const lockScreenUi = new EventEmitter()

export const setLockScreenUI = (intent: FlagshipUI): Promise<null> => {
  handleSideEffects(
    Object.fromEntries(
      Object.entries({
        ...intent,
        bottomTheme: formatTheme(intent.bottomTheme as ThemeInput),
        topTheme: formatTheme(intent.topTheme as ThemeInput)
      })
    )
  )

  return Promise.resolve(null)
}
