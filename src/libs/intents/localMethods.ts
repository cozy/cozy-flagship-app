import { Linking, Platform } from 'react-native'
import { BrowserResult } from 'react-native-inappbrowser-reborn'

import CozyClient from 'cozy-client'
import { FlagshipUI, NativeMethodsRegister } from 'cozy-intent'

import * as RootNavigation from '/libs/RootNavigation'
import strings from '/constants/strings.json'
import { EnvService } from '/core/tools/env'
import { clearClient } from '/libs/client'
import { clearCookies } from '/libs/httpserver/httpCookieManager'
import { clearData } from '/libs/localStore/storage'
import { deleteKeychain } from '/libs/keychain'
import { hideSplashScreen } from '/libs/services/SplashScreenService'
import { openApp } from '/libs/functions/openApp'
import { resetSessionToken } from '/libs/functions/session'
import { routes } from '/constants/routes'
import { sendKonnectorsLogs } from '/libs/konnectors/sendKonnectorsLogs'
import { setDefaultRedirection } from '/libs/defaultRedirection/defaultRedirection'
import { setFlagshipUI } from '/libs/intents/setFlagshipUI'
import { showInAppBrowser, closeInAppBrowser } from '/libs/intents/InAppBrowser'
import { isBiometryDenied } from '/app/domain/authentication/services/BiometryService'
import { toggleSetting } from '/app/domain/settings/services/SettingsService'

export const asyncLogout = async (client?: CozyClient): Promise<null> => {
  if (!client) {
    throw new Error('Logout should not be called with undefined client')
  }

  await sendKonnectorsLogs(client)
  await client.logout()
  await clearClient()
  await resetSessionToken()
  await deleteKeychain()
  await clearCookies()
  await clearData()
  RootNavigation.reset(routes.welcome, { screen: 'welcome' })
  return Promise.resolve(null)
}

const backToHome = (): Promise<null> => {
  RootNavigation.navigate('home')
  return Promise.resolve(null)
}

/**
 * Get the fetchSessionCode function to be called with current CozyClient instance
 * fetchSessionCode gets a session code from the current cozy-client instance
 */
const fetchSessionCodeWithClient = (
  client?: CozyClient
): (() => Promise<string | null>) => {
  return async function fetchSessionCode() {
    if (!client) {
      return null
    }

    const sessionCodeResult = await client.getStackClient().fetchSessionCode()

    if (sessionCodeResult.session_code) {
      return sessionCodeResult.session_code
    }

    throw new Error(
      'session code result should contain a session_code ' +
        JSON.stringify(sessionCodeResult)
    )
  }
}

const openAppOSSettings = async (): Promise<null> => {
  if (Platform.OS === 'android') {
    throw new Error(
      `openAppOSSettings shouldn't be called from Android as no authorization is needed for biometry`
    )
  }

  await Linking.openURL('app-settings:')
  return null
}

const setDefaultRedirectionWithClient = async (
  defaultRedirection: string,
  client?: CozyClient
): Promise<null> => {
  if (!client) {
    return null
  }

  await setDefaultRedirection(defaultRedirection, client)

  return null
}

export const internalMethods = {
  setFlagshipUI: (intent: FlagshipUI): Promise<null> => {
    const caller = (): string => {
      if (!EnvService.nameIs(strings.environments.test)) return 'unknown'

      try {
        return internalMethods.setFlagshipUI.caller.name
      } catch (error) {
        return 'unknown'
      }
    }

    return setFlagshipUI(intent, caller())
  }
}

const isNativePassInstalledOnDevice = async (): Promise<boolean> => {
  return await Linking.canOpenURL('cozypass://')
}

interface CustomMethods {
  fetchSessionCode: () => Promise<string | null>
  showInAppBrowser: (args: { url: string }) => Promise<BrowserResult>
}

/**
 * For now cozy-intent doesn't accept methods resolving to void.
 * We can use this wrapper to still execute an async method an resolve to null no matter what.
 */
const nativeMethodWrapper =
  <T extends () => Promise<void>>(method: T) =>
  async (): Promise<null> => {
    await method()

    return null
  }

export const localMethods = (
  client: CozyClient | undefined
): NativeMethodsRegister | CustomMethods => {
  return {
    backToHome,
    closeInAppBrowser,
    fetchSessionCode: fetchSessionCodeWithClient(client),
    hideSplashScreen: nativeMethodWrapper(hideSplashScreen),
    logout: () => asyncLogout(client),
    openApp: (href, app, iconParams) =>
      openApp(client, RootNavigation, href, app, iconParams),
    toggleSetting,
    setDefaultRedirection: defaultRedirection =>
      setDefaultRedirectionWithClient(defaultRedirection, client),
    setFlagshipUI,
    showInAppBrowser,
    isBiometryDenied,
    openAppOSSettings,
    isNativePassInstalledOnDevice
  }
}
