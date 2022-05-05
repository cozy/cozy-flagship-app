import * as RootNavigation from '../RootNavigation'
import { clearClient, getClient } from '../client'
import { deleteKeychain } from '../keychain'
import { hideSplashScreen } from '../services/SplashScreenService'
import { openApp } from '../functions/openApp'
import { resetSessionToken } from '../functions/session'
import { setFlagshipUI } from './setFlagshipUI'
import { isDevMode } from '../utils'
import { showInAppBrowser, closeInAppBrowser } from './InAppBrowser'

export const asyncLogout = async () => {
  await clearClient()
  await resetSessionToken()
  await deleteKeychain()
  RootNavigation.navigate('authenticate')
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
 * Get a session code from the current cozy-client instance
 *
 * @returns {String}
 * @throws
 */
const fetchSessionCode = async () => {
  const client = await getClient()
  const sessionCodeResult = await client.getStackClient().fetchSessionCode()

  if (sessionCodeResult.session_code) {
    return sessionCodeResult.session_code
  }

  throw new Error(JSON.stringify(sessionCodeResult))
}

export const internalMethods = {
  setFlagshipUI: intent =>
    setFlagshipUI(
      intent,
      isDevMode() && internalMethods.setFlagshipUI.caller.name
    )
}

export const localMethods = {
  backToHome,
  hideSplashScreen,
  logout,
  openApp: (href, app, iconParams) =>
    openApp(RootNavigation, href, app, iconParams),
  setFlagshipUI,
  showInAppBrowser,
  closeInAppBrowser,
  fetchSessionCode
}
