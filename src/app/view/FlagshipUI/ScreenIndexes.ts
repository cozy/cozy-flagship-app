/**
 * Declare all screens ZIndex here
 *
 * This array should be used everytime we call useFlagshipUI to apply a ZIndex to the component
 * All ZIndexes are grouped here to ensure no screen overlap
 */
export const ScreenIndexes = {
  LOGIN_SCREEN: 1,
  ONBOARDING_SCREEN: 1,
  CREATE_INSTANCE_SCREEN: 1,
  ERROR_SCREEN: 1,
  WELCOME_SCREEN: 1,
  HOME_VIEW: 100,
  OS_RECEIVE_SCREEN: 200,
  OAUTH_CLIENT_LIMIT_EXCEDEED: 300,
  LAUNCHER_VIEW: 500,
  PROMPT_PIN_SCREEN: 600,
  COZY_APP_VIEW: 700,
  CLOUDERY_OFFER: 725,
  LOADING_OVERLAY: 750,
  LOCK_SCREEN: 800,
  SPLASH_SCREEN: 100000
}
