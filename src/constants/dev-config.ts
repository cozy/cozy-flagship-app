/**
 * You can modify this object locally, but don't commit changes.
 * For instance: `$ git update-index --assume-unchanged src/constants/dev-config.ts`.
 * Please do not use this object directly in other files, use the exported functions instead.
 */
export const devConfig = {
  disableGetIndex: false, // Bypass HTTPServer HTML generation which will fallback to local stack, useful for webpack-dev-server
  enableLocalSentry: false, // Be warned that it will send actual logs to Sentry on the "test" environment, use sparingly
  enableReduxLogger: false, // Outputs to console every Redux action with payload, prev and next state
  enableKonnectorExtensiveLog: true, // Outputs every post-me exchanges between launcher, pilot and worker, but also every console.* coming from the webview
  forceHideSplashScreen: false, // Hide react-native splash screen renders, useful for debugging in case of a webview crash
  forceOffline: false, // Force offline mode by overwriting the NetInfo module and returning a fake offline state,
  ignoreLogBox: false, // Hide react-native LogBox renders but still display logs to the console,
  cliskKonnectorDevMode: false, // Do not show HomeView but just a special screen to run clisk konnectors
  forceInstallReferrer: false, // Enforce InstallReferrer with the 'enforcedInstallReferrer' string (DevicePersistedStorageKeys.OnboardingPartner must be clear to apply this value)
  enforcedInstallReferrer:
    'utm_source=SOME_PARTNER&utm_content=SOME_CONTEXT&utm_campaign=onboarding_partner&anid=admob',
  disableAutoLock: false // Disregard the device and app settings and disable the auto lock in all cases
}
