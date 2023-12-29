import Minilog from 'cozy-minilog'
import { Platform } from 'react-native'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'

import { generateWebLink } from 'cozy-client'
import { deconstructCozyWebLinkWithSlug } from 'cozy-client/dist/helpers'

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
    log.debug(
      `ReloadInterceptorWebView blocks. Current URL was:${rootBaseUrl} and destination URL was: ${rootUrl}`
    )
    return true
  }

  return false
}

/**
 * The function isSameCozy is used to check if the destination url is in the same instance than the cozy url.
 * sharing is in the same instance than the url of the cozy.
 * @param {Object} options - options for the function
 * @param {string} options.cozyUrl - the url of the cozy
 * @param {string} options.destinationUrl - the url of the destination
 * @param {string} options.subDomainType - the type of subdomain used for the cozy
 * @returns {boolean} - true if the url of the cozy and the url of the destination are in the same instance
 */
export const isSameCozy = ({
  cozyUrl,
  destinationUrl,
  subDomainType = 'flat'
}) => {
  // Let's say our cozyUrl is https://dev.10-0-2-2.nip.io while documenting this function
  const webLink = generateWebLink({
    cozyUrl,
    pathname: '/',
    slug: 'slug',
    subDomainType
  })

  try {
    /**
     * For flat subdomain, the url should be: http://dev-slug.10-0-2-2.nip.io
     * For nested subdomain, the url should be: http://slug.dev.10-0-2-2.nip.io
     */
    const modelURL = new URL(webLink)
    /**
     * For flat subdomain, the url should be: http://dev-contacts.10-0-2-2.nip.io
     * For nested subdomain, the url should be: http://contacts.dev.10-0-2-2.nip.io
     */
    const inputUrl = new URL(destinationUrl)

    // If the protocol is not the same, exit early
    if (inputUrl.protocol !== modelURL.protocol) return false

    /**
     * For flat subdomain, the modelArray should be: ['dev-slug', '10-0-2-2', 'nip','io']
     * For nested subdomain, the modelArray should be: ['slug', 'dev', '10-0-2-2', 'nip','io']
     */
    const modelArray = modelURL.hostname.split('.')
    /**
     * For flat subdomain, the inputArray should be: ['dev-contacts', '10-0-2-2', 'nip', io']
     * For nested subdomain, the inputArray should be: ['contacts', 'dev', '10-0-2-2', 'nip', 'io']
     */
    const inputArray = inputUrl.hostname.split('.')

    // In subdomain cases, we look at the second part of the hostname
    // It should always be the same, otherwise it's not the same cozy
    if (`${modelArray.slice(1)}` !== `${inputArray.slice(1)}`) return false

    // We need an extra check for each subdomain type

    // Flat subdomains
    // We're comparing the first part of the hostname, like 'dev-slug' vs 'dev-contacts'
    // What's before the first hyphen must be identical, otherwise it's not the same cozy
    if (
      subDomainType === 'flat' &&
      modelArray[0].split('-')[0] !== inputArray[0].split('-')[0]
    )
      return false

    // Nested subdomains
    // We're comparing the second part of the hostname, like 'dev' vs 'dev'
    // It must be identical, otherwise it's not the same cozy
    if (subDomainType === 'nested' && modelArray[1] !== inputArray[1])
      return false

    return true
  } catch (error) {
    // Most likely any error is linked to a failed URL() parsing
    // In any case we don't want to throw and just assume it's not the same cozy
    log.error('Error while calling isSameCozy', error)
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
 * @returns {false | string} false if no slug switch is detected, otherwise the slug's value
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
