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

  window.addEventListener('load', event => {
    window.document.body.classList.add(
      'flagship-app',
      'flagship-os-${Platform.OS}',
      'flagship-route-${routeName}'
    )
    // make the webapp non-zoomable
    var meta = document.createElement('meta')
    meta.setAttribute('name', 'viewport')
    meta.setAttribute('content', 'width = device-width, initial-scale = 1.0, minimum-scale = 1.0, maximum-scale = 1.0, user-scalable = no')
    document.getElementsByTagName('head')[0].appendChild(meta)
  })
`
