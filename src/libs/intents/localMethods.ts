import CozyClient from 'cozy-client'

import * as RootNavigation from '../RootNavigation'
import strings from '/strings.json'
import { EnvService } from '/libs/services/EnvService'
import { FlagshipUI, NativeMethodsRegister } from 'cozy-intent'
import { clearClient } from '../client'
import { deleteKeychain } from '../keychain'
import { hideSplashScreen } from '../services/SplashScreenService'
import { openApp } from '../functions/openApp'
import { resetSessionToken } from '../functions/session'
import { routes } from '/constants/routes'
import { setFlagshipUI } from './setFlagshipUI'
import { showInAppBrowser, closeInAppBrowser } from './InAppBrowser'
import { toggleSetting } from '/libs/intents/toggleSetting'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const asyncLogout = async (): Promise<null> => {
  await clearClient()
  await resetSessionToken()
  await deleteKeychain()
  await AsyncStorage.clear()
  RootNavigation.reset(routes.stack, { screen: 'welcome' })
  return Promise.resolve(null)
}

// Since logout is used from localMethods
// it can't be async for now.
const logout = (): Promise<null> => {
  return asyncLogout()
}

const backToHome = (): Promise<null> => {
  RootNavigation.navigate('home')
  return Promise.resolve(null)
}

/**
 * Get the fetchSessionCode function to be called with current CozyClient instance
 * fetchSessionCode gets a session code from the current cozy-client instance
 *
 * @param {CozyClient} client - current CozyClient instance
 *
 * @returns {Function|null}
 * @throws error containing invalid session code result
 */
const fetchSessionCodeWithClient = (
  client?: CozyClient
): (() => Promise<null>) => {
  return async function fetchSessionCode() {
    if (!client) {
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const sessionCodeResult = await client.getStackClient().fetchSessionCode()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (sessionCodeResult.session_code) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return sessionCodeResult.session_code
    }

    throw new Error(
      'session code result should contain a session_code ' +
        JSON.stringify(sessionCodeResult)
    )
  }
}

export const internalMethods = {
  setFlagshipUI: (intent: FlagshipUI): Promise<null> =>
    setFlagshipUI(
      intent,
      EnvService.nameIs(strings.environments.test)
        ? internalMethods.setFlagshipUI.caller?.name // eslint-disable-line @typescript-eslint/no-unnecessary-condition
        : ''
    )
}

export const localMethods = (
  client: CozyClient | undefined
): NativeMethodsRegister => {
  return {
    backToHome,
    // @ts-expect-error function to be converted to TS
    closeInAppBrowser,
    fetchSessionCode: fetchSessionCodeWithClient(client),
    // @ts-expect-error function to be converted to TS
    hideSplashScreen,
    logout,
    openApp: (href, app, iconParams) =>
      openApp(RootNavigation, href, app, iconParams),
    toggleSetting,
    setFlagshipUI,
    // @ts-expect-error function to be converted to TS
    showInAppBrowser
  }
}
