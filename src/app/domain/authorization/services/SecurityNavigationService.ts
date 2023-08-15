import {
  BackHandler,
  NativeEventSubscription,
  AppState,
  AppStateStatus
} from 'react-native'

import { routes } from '/constants/routes'
import { devlog } from '/core/tools/env'
import { navigationRef } from '/libs/RootNavigation'

let backHandler: NativeEventSubscription | null = null
let appState = AppState.currentState
let appStateSubscription: NativeEventSubscription | null = null

// Define the routes that should trigger an app exit when the back button is pressed
const exitRoutes = [
  routes.lock,
  routes.promptPin,
  routes.promptPassword
] as string[]

/**
 * Handle back button press
 * If the current route is one of the defined exit routes, the app will be exited.
 * Otherwise, the back button press event is ignored, and the event will propagate
 * to the other listeners (if any).
 */
const handleBackPress = (): boolean => {
  devlog('🔏', 'BackHandler listener triggered in SecurityNavigationService')

  const currentRouteName = navigationRef.current?.getCurrentRoute()?.name

  if (currentRouteName && exitRoutes.includes(currentRouteName)) {
    devlog('🔏', `BackHandler will exit app for route "${currentRouteName}`)

    BackHandler.exitApp()

    return true
  }

  devlog(
    '🔏',
    `BackHandler listener in SecurityNavigationService will allow back naviation`
  )

  return false
}

/**
 * Handle app state changes
 * When the app comes to the foreground, start listening to back button presses
 * When the app goes to the background, stop listening to avoid leaks
 */
const handleAppStateChange = (nextAppState: AppStateStatus): void => {
  devlog('🔏', `Handling new app state with value: "${nextAppState}"`)

  if (appState.match(/inactive|background/) && nextAppState === 'active') {
    devlog('🔏', 'App has come to the foreground')

    startListening()
  } else {
    devlog('🔏', 'App is going to the background')

    stopListening()
  }
  appState = nextAppState
}

/**
 * Start listening to back button presses and app state changes
 * This function is idempotent, so it's safe to call multiple times.
 */
const startListening = (): void => {
  devlog('🔏', 'BackHandler listener started in SecurityNavigationService')

  if (!backHandler) {
    backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    )
  }

  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
  }
}

/**
 * Stop listening to back button presses and app state changes
 * This function is idempotent, so it's safe to call multiple times.
 */
const stopListening = (): void => {
  devlog('🔏', 'BackHandler listener stopped in SecurityNavigationService')

  if (backHandler) {
    backHandler.remove()
    backHandler = null
  }

  if (appStateSubscription) {
    appStateSubscription.remove()
    appStateSubscription = null
  }
}

export const SecurityNavigationService = {
  startListening,
  stopListening
}
