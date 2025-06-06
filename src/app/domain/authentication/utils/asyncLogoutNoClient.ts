import { deleteKeychain } from '/libs/keychain'
import { clearCookies } from '/libs/httpserver/httpCookieManager'
import { clearCozyData } from '/libs/localStore/storage'
import { routes } from '/constants/routes'
import { navigationRef } from '/libs/RootNavigation'

export const asyncLogoutNoClient = async (): Promise<void> => {
  await deleteKeychain()
  await clearCookies()
  await clearCozyData()
  navigationRef.reset({
    index: 0,
    routes: [{ name: routes.welcome, params: { options: 'showTokenError' } }]
  })
}
