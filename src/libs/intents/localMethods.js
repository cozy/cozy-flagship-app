import * as RootNavigation from '../RootNavigation.js'
import {clearClient} from '../client'
import {resetSessionToken} from '../functions/session'
import {openApp} from '../functions/openApp.js'

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
}
