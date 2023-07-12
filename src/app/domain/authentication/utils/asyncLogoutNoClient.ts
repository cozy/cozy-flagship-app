import { clearClient } from '/libs/clientHelpers/persistClient'
import { resetSessionToken } from '/libs/functions/session'
import { deleteKeychain } from '/libs/keychain'
import { clearCookies } from '/libs/httpserver/httpCookieManager'
import { clearData } from '/libs/localStore/storage'
import { routes } from '/constants/routes'
import { navigationRef } from '/libs/RootNavigation'

export const asyncLogoutNoClient = async (): Promise<void> => {
  await clearClient()
  await resetSessionToken()
  await deleteKeychain()
  await clearCookies()
  await clearData()
  navigationRef.reset({
    index: 0,
    routes: [{ name: routes.welcome, params: { options: 'showTokenError' } }]
  })
}
