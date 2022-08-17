import { Platform } from 'react-native'

import Minilog from '@cozy/minilog'

const log = Minilog('CozyWebView')

const formatUrlToCompare = url => {
  const { host, pathname } = new URL(url)
  return `http://${host}${pathname}`
}

export const checkIsReload = (initialRequest, preventRefreshByDefault) => {
  const { navigationType } = initialRequest

  if (Platform.OS === 'ios' && preventRefreshByDefault) {
    return false
  }

  if (navigationType === 'reload') {
    return true
  }

  return false
}

export const checkIsRedirectOutside = ({ currentUrl, destinationUrl }) => {
  const realUrl = destinationUrl === 'about:blank' ? currentUrl : destinationUrl
  const rootUrl = formatUrlToCompare(realUrl)
  const rootBaseUrl = formatUrlToCompare(currentUrl)

  if (rootUrl !== rootBaseUrl) {
    log.error(
      `ReloadInterceptorWebView blocks. Current URL was:${rootBaseUrl} and destination URL was: ${rootUrl}`
    )
    return true
  }

  return false
}
