import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { hideSplashScreen } from '/app/theme/SplashScreenService'
import { ScreenIndexes } from '/app/view/FlagshipUI'
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

  let LockComponent: (() => JSX.Element) | null = null
  switch (currentSecurityScreen) {
    case lockScreens.LOCK_SCREEN: {
      LockComponent = LockScreen
      break
    }
    case lockScreens.PASSWORD_PROMPT: {
      LockComponent = PasswordPrompt
      break
    }
    case lockScreens.PIN_PROMPT: {
      LockComponent = PinPrompt
      break
    }
    case lockScreens.SET_PASSWORD: {
      LockComponent = SetPasswordView
      break
    }
    case lockScreens.SET_PIN: {
      LockComponent = SetPinView
      break
    }
    default: {
      LockComponent = null
      break
    }
  }

  if (!LockComponent) {
    return null
  }

  return (
    <View style={styles.fullScreen}>
      <LockComponent />
    </View>
  )
}

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: ScreenIndexes.LOCK_SCREEN
  }
})
