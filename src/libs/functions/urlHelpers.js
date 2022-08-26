import { Platform } from 'react-native'

import { deconstructCozyWebLinkWithSlug } from 'cozy-client'

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

/**
 * Compare current URL and target URL and detect if the app should navigate to another cozy-app
 * or if it is another type of navigation (same cozy-app or outgoing link)
 *
 * @param {object} params
 * @param {string} params.currentUrl - the current URL
 * @param {string} params.destinationUrl - the URL we want to navigate to
 * @param {'flat' | 'nested'} params.subdomainType - the Cozy's subdomain type
 * @returns false if no slug switch is detected, otherwise the slug's value
 */
export const checkIsSlugSwitch = ({
  currentUrl,
  destinationUrl,
  subdomainType = 'flat'
}) => {
  try {
    const currentUrlData = deconstructCozyWebLinkWithSlug(
      currentUrl,
      subdomainType
    )
    const destinationUrlData = deconstructCozyWebLinkWithSlug(
      destinationUrl,
      subdomainType
    )

    if (currentUrlData.cozyBaseDomain !== destinationUrlData.cozyBaseDomain) {
      return false
    }

    if (currentUrlData.slug !== destinationUrlData.slug) {
      return destinationUrlData.slug
    }

    return false
  } catch (err) {
    log.error('Error while calling checkIsSlugSwitch', err)
    return false
  }
}
