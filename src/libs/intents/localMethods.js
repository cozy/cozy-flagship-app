import * as RootNavigation from '../RootNavigation.js'
import {clearClient} from '../client'
import {resetSessionToken} from '../functions/session'
import {openApp} from '../functions/openApp.js'
import {deleteKeychain} from '../keychain'
import RNBootSplash from 'react-native-bootsplash'

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
  logout,
  openApp: (href, app) => openApp(RootNavigation, href, app),
  hideSplashScreen: () => RNBootSplash.hide({fade: true}),
}
