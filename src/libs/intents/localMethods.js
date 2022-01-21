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

export const localMethods = {
  logout,
  openApp: (href, app) => openApp(RootNavigation, href, app),
}
