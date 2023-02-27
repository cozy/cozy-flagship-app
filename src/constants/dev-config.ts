/**
 * You can modify this object locally, but don't commit changes.
 * For instance: `$ git update-index --assume-unchanged src/constants/dev-config.ts`.
 * Please do not use this object directly in other files, use the exported functions instead.
 */
export const devConfig = {
  disableGetIndex: false, // Bypass HTTPServer HTML generation which will fallback to local stack, useful for webpack-dev-server
  enableLocalSentry: false, // Be warned that it will send actual logs to Sentry on the "test" environment, use sparingly
  enableReduxLogger: false, // Outputs to console every Redux action with payload, prev and next state
  forceHideSplashScreen: false, // Hide react-native splash screen renders, useful for debugging in case of a webview crash
  forceOffline: false, // Force offline mode by overwriting the NetInfo module and returning a fake offline state,
  ignoreLogBox: true, // Hide react-native LogBox renders but still display logs to the console,
  konnectorServer: 'http://172.28.246.230:3000' // Use local konnectors instead of the ones from the stack, e.g. "http://172.31.47.56:3000"
}
