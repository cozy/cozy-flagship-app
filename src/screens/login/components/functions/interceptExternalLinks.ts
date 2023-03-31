import type { WebViewNavigation } from 'react-native-webview'
import type { WebViewOpenWindowEvent } from 'react-native-webview/lib/WebViewTypes'

import { showInAppBrowser } from '/libs/intents/InAppBrowser'

type NavigationHandler = (request: WebViewNavigation) => boolean

export const interceptExternalLinksAndOpenInAppBrowser = (
  baseUri: string,
  exceptionOrigins: string[],
  parentHandleNavigation: NavigationHandler
) => {
  return (request: WebViewNavigation): boolean => {
    const baseUrl = new URL(baseUri)
    const targetUrl = new URL(request.url)

    if (
      baseUrl.origin !== targetUrl.origin &&
      !exceptionOrigins.includes(targetUrl.origin)
    ) {
      void showInAppBrowser({ url: request.url })
      return false
    }

    return parentHandleNavigation(request)
  }
}

export const openWindowWithInAppBrowser = (
  syntheticEvent: WebViewOpenWindowEvent
): void => {
  const { nativeEvent } = syntheticEvent
  void showInAppBrowser({ url: nativeEvent.targetUrl })
}
