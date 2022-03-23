import * as RootNavigation from '../RootNavigation'
import {clearClient} from '../client'
import {deleteKeychain} from '../keychain'
import {hideSplashScreen} from '../services/SplashScreenService'
import {openApp} from '../functions/openApp'
import {resetSessionToken} from '../functions/session'
import {setFlagshipUI} from './setFlagshipUI'

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

export const localMethods = {
  backToHome,
  hideSplashScreen,
  logout,
  openApp: (href, app, iconParams) =>
    openApp(RootNavigation, href, app, iconParams),
  setFlagshipUI,
}
