import * as RootNavigation from '../RootNavigation'
import {clearClient} from '../client'
import {openApp} from '../functions/openApp'
import {resetSessionToken} from '../functions/session'
import {deleteKeychain} from '../keychain'
import {hideSplashScreen} from '../services/SplashScreenService'

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
  changeBarColors(true)
  RootNavigation.navigate('home')
}

export const localMethods = {
  backToHome,
  logout,
  openApp: (href, app) => openApp(RootNavigation, href, app),
  hideSplashScreen,
}
