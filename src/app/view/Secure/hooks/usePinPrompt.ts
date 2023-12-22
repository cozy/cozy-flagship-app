import { useEffect } from 'react'

import { devlog } from '/core/tools/env'
import { doPinCodeAutoLock } from '/app/domain/authorization/services/SecurityService'
import { hideSplashScreen } from '/app/theme/SplashScreenService'
import {
  hideSecurityScreen,
  lockScreens,
  showSecurityScreen
} from '/app/view/Lock/useLockScreenWrapper'

export const usePinPrompt = (): {
  handleSetPinCode: () => void
  handleIgnorePinCode: () => void
} => {
  // The HomeView should have called hideSplashScreen() already,
  // but in case it didn't, we do it here as a fallback as it is critical
  useEffect(() => {
    devlog('🔏', 'usePinPrompt', 'hiding splash screen')
    void hideSplashScreen()
  }, [])

  const handleSetPinCode = (): void => {
    try {
      void doPinCodeAutoLock()
    } catch (error) {
      devlog(error)
    }
    showSecurityScreen(lockScreens.SET_PIN)
  }

  const handleIgnorePinCode = (): void => {
    try {
      void doPinCodeAutoLock()
    } catch (error) {
      devlog(error)
    }
    hideSecurityScreen(lockScreens.PIN_PROMPT)
  }

  return {
    handleSetPinCode,
    handleIgnorePinCode
  }
}
