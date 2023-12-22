import { EventEmitter } from 'events'

import { useEffect, useState } from 'react'

const lockScreenEventHandler = new EventEmitter()

const lockScreenEvents = {
  SHOW: 'SHOW',
  HIDE: 'HIDE'
} as const

export const lockScreens = {
  LOCK_SCREEN: 'LOCK_SCREEN',
  PASSWORD_PROMPT: 'PASSWORD_PROMPT',
  PIN_PROMPT: 'PIN_PROMPT',
  SET_PASSWORD: 'SET_PASSWORD',
  SET_PIN: 'SET_PIN'
} as const

export type LockScreenEnum = keyof typeof lockScreens

export const showSecurityScreen = (screen: LockScreenEnum): void => {
  lockScreenEventHandler.emit(lockScreenEvents.SHOW, screen)
}
export const hideSecurityScreen = (screen: LockScreenEnum): void => {
  lockScreenEventHandler.emit(lockScreenEvents.HIDE, screen)
}

interface LockScreenState {
  currentSecurityScreen: LockScreenEnum | undefined
}

export const useLockScreenWrapper = (): LockScreenState => {
  const [currentScreen, setCurrentScreen] = useState<
    LockScreenEnum | undefined
  >(undefined)

  useEffect(() => {
    const showHandler = (screen: LockScreenEnum): void => {
      setCurrentScreen(screen)
    }

    const hideHandler = (): void => {
      // for now we don't display multiple secure screens simultaneously
      // so let's hide them all
      setCurrentScreen(undefined)
    }

    const subscriptionShow = lockScreenEventHandler.addListener(
      lockScreenEvents.SHOW,
      showHandler
    )
    const subscriptionHide = lockScreenEventHandler.addListener(
      lockScreenEvents.HIDE,
      hideHandler
    )

    return (): void => {
      subscriptionShow.removeListener(lockScreenEvents.SHOW, showHandler)
      subscriptionHide.removeListener(lockScreenEvents.HIDE, hideHandler)
    }
  }, [])

  return {
    currentSecurityScreen: currentScreen
  }
}
