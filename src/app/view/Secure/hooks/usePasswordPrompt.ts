import { useEffect } from 'react'

import { devlog } from '/core/tools/env'
import { hideSplashScreen } from '/app/theme/SplashScreenService'
import {
  lockScreens,
  showSecurityScreen
} from '/app/view/Lock/useLockScreenWrapper'

export const usePasswordPrompt = (): (() => void) => {
  // The HomeView should have called hideSplashScreen() already,
  // but in case it didn't, we do it here as a fallback as it is critical
  useEffect(() => {
    devlog('🔏', 'usePasswordPrompt', 'hiding splash screen')
    void hideSplashScreen()
  }, [])

  const handleSetPassword = (): void => {
    showSecurityScreen(lockScreens.SET_PASSWORD)
  }

  return handleSetPassword
}
