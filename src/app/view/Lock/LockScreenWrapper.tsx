import React, { useEffect } from 'react'

import { hideSplashScreen } from '/app/theme/SplashScreenService'
import { LockScreen } from '/app/view/Lock/LockScreen'
import {
  lockScreens,
  useLockScreenWrapper
} from '/app/view/Lock/useLockScreenWrapper'
import { PasswordPrompt } from '/app/view/Secure/PasswordPrompt'
import { PinPrompt } from '/app/view/Secure/PinPrompt'
import { SetPasswordView } from '/app/view/Secure/SetPasswordView'
import { SetPinView } from '/app/view/Secure/SetPinView'

export const LockScreenWrapper = (): JSX.Element | null => {
  const { currentSecurityScreen } = useLockScreenWrapper()

  useEffect(() => {
    if (currentSecurityScreen) {
      void hideSplashScreen()
    }
  }, [currentSecurityScreen])

  switch (currentSecurityScreen) {
    case lockScreens.LOCK_SCREEN: {
      return <LockScreen />
    }
    case lockScreens.PASSWORD_PROMPT: {
      return <PasswordPrompt />
    }
    case lockScreens.PIN_PROMPT: {
      return <PinPrompt />
    }
    case lockScreens.SET_PASSWORD: {
      return <SetPasswordView />
    }
    case lockScreens.SET_PIN: {
      return <SetPinView />
    }
    default: {
      return null
    }
  }
}
