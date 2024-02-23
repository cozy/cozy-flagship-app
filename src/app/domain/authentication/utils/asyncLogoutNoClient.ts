import { deleteKeychain } from '/libs/keychain'
import { clearCookies } from '/libs/httpserver/httpCookieManager'
import { clearCozyData } from '/libs/localStore/storage'
import { routes } from '/constants/routes'
import { navigationRef } from '/libs/RootNavigation'
import { stopTrackingAndClearData } from '/app/domain/geolocation/services/tracking'

export const asyncLogoutNoClient = async (): Promise<void> => {
  await deleteKeychain()
  await clearCookies()
  await clearCozyData()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await stopTrackingAndClearData()
  navigationRef.reset({
    index: 0,
    routes: [{ name: routes.welcome, params: { options: 'showTokenError' } }]
  })
}
