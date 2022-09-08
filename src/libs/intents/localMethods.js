import * as RootNavigation from '../RootNavigation'
import strings from '/strings'
import { EnvService } from '/libs/services/EnvService'
import { clearClient } from '../client'
import { deleteKeychain } from '../keychain'
import { hideSplashScreen } from '../services/SplashScreenService'
import { openApp } from '../functions/openApp'
import { resetSessionToken } from '../functions/session'
import { openSettingBiometry } from '/libs/intents/setBiometryState'
import { setFlagshipUI } from './setFlagshipUI'
import { showInAppBrowser, closeInAppBrowser } from './InAppBrowser'

export const asyncLogout = async () => {
  await clearClient()
  await resetSessionToken()
  await deleteKeychain()
  RootNavigation.reset('authenticate')
}

// Since logout is used from localMethods
// it can't be async for now.
const logout = () => {
  asyncLogout()
}

const backToHome = () => {
  RootNavigation.navigate('home')
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
const fetchSessionCodeWithClient = client => {
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

export const internalMethods = {
  setFlagshipUI: intent =>
    setFlagshipUI(
      intent,
      EnvService.nameIs(strings.environments.test) &&
        internalMethods.setFlagshipUI.caller?.name
    )
}

export const localMethods = client => {
  return {
    backToHome,
    closeInAppBrowser,
    fetchSessionCode: fetchSessionCodeWithClient(client),
    hideSplashScreen,
    logout,
    openApp: (href, app, iconParams) =>
      openApp(RootNavigation, href, app, iconParams),
    openSettingBiometry,
    setFlagshipUI,
    showInAppBrowser
  }
}
