import { useEffect } from 'react'

import { devlog } from '/core/tools/env'
import { doPinCodeAutoLock } from '/app/domain/authorization/services/SecurityService'
import { hideSplashScreen } from '/app/theme/SplashScreenService'
import { navigate } from '/libs/RootNavigation'
import { routes } from '/constants/routes'
import {
  hideSecurityScreen,
  lockScreens,
  showSecurityScreen
} from '/app/view/Lock/useLockScreenWrapper'

export const usePinPrompt = (
  onSuccess?: () => void
): { handleSetPinCode: () => void; handleIgnorePinCode: () => void } => {
  // The HomeView should have called hideSplashScreen() already,
  // but in case it didn't, we do it here as a fallback as it is critical
  useEffect(() => {
    devlog('🔏', 'usePinPrompt', 'hiding splash screen')
    void hideSplashScreen()
  }, [])

  const handleSetPinCode = (): void => {
    try {
      void doPinCodeAutoLock()

      showSecurityScreen(lockScreens.SET_PIN)
    } catch (error) {
      devlog(error)

      // Navigate to the setPin route as a fallback
      // with a dummy onSuccess callback returning to the home route
      showSecurityScreen(lockScreens.SET_PIN)
    }
  }

  const handleIgnorePinCode = (): void => {
    try {
      if (!onSuccess)
        throw new Error('No onSuccess callback given to PinPrompt')

      void doPinCodeAutoLock()
      hideSecurityScreen(lockScreens.PIN_PROMPT)
    } catch (error) {
      devlog(error)

    // Navigate to the home route as a fallback
    hideSecurityScreen(lockScreens.PIN_PROMPT)
    }
  }

  return {
    handleSetPinCode,
    handleIgnorePinCode
  }
}
