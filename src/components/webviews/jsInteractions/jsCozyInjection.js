import { Platform } from 'react-native'

import { version } from '../../../../package.json'
import { statusBarHeight, navbarHeight } from '../../../libs/dimensions'

const immersiveRoutes = ['home']

const makeMetadata = routeName =>
  JSON.stringify({
    immersive: immersiveRoutes.includes(routeName),
    navbarHeight,
    platform: Platform,
    routeName,
    statusBarHeight,
    version
  })

export const jsCozyGlobal = routeName => `
  if (!window.cozy) window.cozy = {}

  window.cozy.isFlagshipApp = true
  window.cozy.ClientConnectorLauncher = 'react-native'
  window.cozy.flagship = ${makeMetadata(routeName)}

  window.addEventListener('load', event => {
    window.document.body.classList.add(
      'flagship-app',
      'flagship-os-${Platform.OS}',
      'flagship-route-${routeName}'
    )
  })
`
