import { useSecureBackgroundSplashScreen } from '/hooks/useSplashScreen'

interface SecureBackgroundSplashScreenWrapperProps {
  children: JSX.Element
}

export const SecureBackgroundSplashScreenWrapper = ({
  children
}: SecureBackgroundSplashScreenWrapperProps): JSX.Element => {
  useSecureBackgroundSplashScreen()

  return children
}
