import { Platform } from 'react-native'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'

import { deconstructCozyWebLinkWithSlug } from 'cozy-client/dist/helpers'

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
 *
 * @param {object} params
 * @param {string} params.cozyUrl The URL of the cozy, from client.stackclient.uri
 * @param {string} params.destinationUrl The URL we want to redirect the user
 * @param {'flat' | 'nested'} params.subdomainType - the Cozy's subdomain type
 * @returns {boolean} True is the destination is the same cozy
 */
export const isSameCozy = ({
  cozyUrl,
  destinationUrl,
  subdomainType = 'flat'
}) => {
  try {
    const currentUrlData = deconstructCozyWebLinkWithSlug(
      cozyUrl,
      subdomainType
    )
    const destinationUrlData = deconstructCozyWebLinkWithSlug(
      destinationUrl,
      subdomainType
    )
    if (
      currentUrlData.cozyBaseDomain !== destinationUrlData.cozyBaseDomain ||
      currentUrlData.cozyName !== destinationUrlData.cozyName
    ) {
      return false
    }

    return true
  } catch (err) {
    log.error('Error while calling isSameCozy', err)
    return false
  }
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

    if (
      currentUrlData.slug !== destinationUrlData.slug &&
      destinationUrlData.slug !== undefined
    ) {
      return destinationUrlData.slug
    }

    return false
  } catch (err) {
    log.error('Error while calling checkIsSlugSwitch', err)
    return false
  }
}

export const checkIsSameApp = ({
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

    return (
      currentUrlData.cozyBaseDomain === destinationUrlData.cozyBaseDomain &&
      currentUrlData.slug === destinationUrlData.slug
    )
  } catch (err) {
    log.error('Error while calling checkIsSlugSwitch', err)
    return false
  }
}

const IAB_OPTIONS = {
  // iOS Properties
  readerMode: false,
  animated: true,
  modalPresentationStyle: 'fullScreen',
  modalTransitionStyle: 'coverVertical',
  modalEnabled: true,
  enableBarCollapsing: false,
  // Android Properties
  showTitle: true,
  toolbarColor: '#8e9094',
  secondaryToolbarColor: 'black',
  enableUrlBarHiding: true,
  enableDefaultShare: true,
  forceCloseOnRedirection: false,
  showInRecents: true,
  animations: {
    startEnter: 'slide_in_right',
    startExit: 'slide_out_left',
    endEnter: 'slide_in_left',
    endExit: 'slide_out_right'
  }
}

export const openUrlInAppBrowser = url => {
  try {
    InAppBrowser.open(url, IAB_OPTIONS)
  } catch (error) {
    /*
     * In terms of UX, we prefer to close the current InAppBrowser if it is already opened
     * and open a new one instead of doing nothing.
     */
    if (error.message === 'Another InAppBrowser is already being presented.') {
      log.warn(
        'We are trying to open a new InAppBrowser but there is already one opened. We are closing the current one and opening a new one'
      )

      InAppBrowser.close()
      InAppBrowser.open(url, IAB_OPTIONS)
    } else {
      /**
       * In other cases, we throw the error to let the caller handle the error
       * (for example, we could have an error while opening the InAppBrowser because the URL is not valid)
       */
      throw error
    }
  }
}
