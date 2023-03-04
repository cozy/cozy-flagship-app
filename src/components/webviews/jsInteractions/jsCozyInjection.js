import { Platform } from 'react-native'

import { version } from '../../../../package.json'

import { getDimensions } from '/libs/dimensions'

const immersiveRoutes = ['home']

const makeMetadata = routeName => {
  const { navbarHeight, statusBarHeight } = getDimensions()

  return JSON.stringify({
    immersive: immersiveRoutes.includes(routeName),
    navbarHeight,
    platform: Platform,
    routeName,
    statusBarHeight,
    version
  })
}

export const jsCozyGlobal = (routeName, isSecureProtocol) => `
  if (!window.cozy) window.cozy = {}
  window.cozy.isFlagshipApp = true
  window.cozy.ClientKonnectorLauncher = 'react-native'
  window.cozy.ClientConnectorLauncher = 'react-native' // deprecated
  window.cozy.flagship = ${makeMetadata(routeName)}
  window.cozy.isSecureProtocol = ${isSecureProtocol || 'false'}
  // We have random issue on iOS when the app's script is executed
  // before the view port. To fix that, we wait the load Event
  // and then we dispatch the resize even to wake up
  // cozy-ui's breakpoint.
  // for instance https://stackoverflow.com/questions/5508455/mobile-safari-window-reports-980px/35987682#35987682
  window.addEventListener('load', () => {
    window.dispatchEvent(new Event('resize'));
  })
`
