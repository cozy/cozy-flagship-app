import { Platform } from 'react-native'

import Minilog from 'cozy-minilog'

import { shouldDisableGetIndex } from '/core/tools/env'
import { getDimensions } from '/libs/dimensions'
import { getCurrentRouteName, navigationRef } from '/libs/RootNavigation'

import { version } from '../../../../package.json'

// This will have the effect of reverting OS icons to white when closing UI modals
const immersiveRoutes = ['home', 'default']

const makeMetadata = (routeName?: string): string => {
  console.log('💜 getDimensions() from makeMetadata')
  const { navbarHeight, statusBarHeight } = getDimensions()

  return JSON.stringify({
    immersive: routeName ? immersiveRoutes.includes(routeName) : false,
    navbarHeight,
    platform: Platform,
    routeName,
    statusBarHeight,
    version,
    backup_available: true // deprecated
  })
}

export const jsCozyGlobal = (
  routeName?: string,
  isSecureProtocol?: boolean
): string => {
  const baseHTML = `
    if (!window.cozy) window.cozy = {}
    window.cozy.isFlagshipApp = true
    window.cozy.ClientKonnectorLauncher = 'react-native'
    window.cozy.ClientConnectorLauncher = 'react-native' // deprecated
    window.cozy.flagship = ${makeMetadata(
      routeName ?? getCurrentRouteName() ?? ''
    )}
    window.cozy.isSecureProtocol = ${isSecureProtocol ? 'true' : 'false'}
    // We have random issue on iOS when the app's script is executed
    // before the view port. To fix that, we wait the load Event
    // and then we dispatch the resize even to wake up
    // cozy-ui's breakpoint.
    window.addEventListener('load', () => {
      window.dispatchEvent(new Event('resize'));
    })
  `

  /**
   * When disabling the HTTP server in local development environment (see `dev-config.ts`),
   * The CSS variables `--flagship-top-height` and `--flagship-bottom-height` are not set
   * in the WebView. To counter this, we inject them manually at runtime.
   * This code block is never intended to be executed in production.
   *
   * Still, we wrap it in a try/catch block to avoid breaking the WebView in case of error.
   */
  try {
    if (shouldDisableGetIndex()) {
      console.log('💜 getDimensions() from shouldDisableGetIndex')
      const { navbarHeight, statusBarHeight } = getDimensions()
      const osClass = `flagship-os-${Platform.OS}`
      const routeClass = `flagship-route-${
        navigationRef.getCurrentRoute()?.name ?? 'unknown'
      }`
      const classesToAdd = `flagship-app ${osClass} ${routeClass}`

      return `
        ${baseHTML}
        let style = document.createElement('style');
        style.innerHTML = \`
          body {
            --flagship-top-height: ${statusBarHeight}px;
            --flagship-bottom-height: ${navbarHeight}px;
          }
        \`;
        document.head.appendChild(style);
        document.body.classList.add('${classesToAdd.split(' ').join("','")}');
      `
    }
  } catch (error) {
    Minilog('jsCozyGlobal').error(error)
  }

  return baseHTML
}
