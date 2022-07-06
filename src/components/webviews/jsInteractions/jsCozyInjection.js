import { Platform } from 'react-native'

import { version } from '../../../../package.json'
import { statusBarHeight, getNavbarHeight } from '../../../libs/dimensions'

const immersiveRoutes = ['home']

const makeMetadata = routeName =>
  JSON.stringify({
    immersive: immersiveRoutes.includes(routeName),
    navbarHeight: getNavbarHeight(),
    platform: Platform,
    routeName,
    statusBarHeight,
    version
  })

export const jsCozyGlobal = (routeName, isSecureProtocol) => `
  if (!window.cozy) window.cozy = {}

  window.cozy.isFlagshipApp = true
  window.cozy.ClientConnectorLauncher = 'react-native'
  window.cozy.flagship = ${makeMetadata(routeName)}
  window.cozy.isSecureProtocol = ${isSecureProtocol || 'false'}
`
