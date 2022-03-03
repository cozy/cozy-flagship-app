import * as RootNavigation from '../RootNavigation'
import {clearClient} from '../client'
import {openApp} from '../functions/openApp'
import {resetSessionToken} from '../functions/session'
import {setStatusBarColor} from './setStatusBarColor'
import {setNavBarColor} from './setNavBarColor'

const logout = () => {
  const asyncCore = async () => {
    await clearClient()
    await resetSessionToken()

    RootNavigation.navigate('authenticate')
  }

  asyncCore()
}

const backToHome = () => {
  RootNavigation.navigate('home')
}

export const localMethods = {
  backToHome,
  logout,
  openApp: (href, app) => openApp(RootNavigation, href, app),
  setStatusBarColor,
  setNavBarColor,
}
