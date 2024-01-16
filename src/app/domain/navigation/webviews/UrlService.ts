import { Platform } from 'react-native'
import type WebView from 'react-native-webview'

import { navigateToApp } from '/libs/functions/openApp'
import {
  checkIsReload,
  checkIsRedirectOutside,
  checkIsSameApp,
  checkIsSlugSwitch,
  openUrlInAppBrowser
} from '/libs/functions/urlHelpers'
import {
  checkIsPreviewableLink,
  getFileExtentionFromCozyDownloadUrl,
  previewFileFromDownloadUrl
} from '/libs/functions/filePreviewHelper'
import { safePromise } from '/utils/safePromise'
import {
  isOauthClientLimitExceededUrl,
  showOauthClientsLimitExceeded
} from '/app/domain/limits/OauthClientsLimitService'
import {
  InterceptNavigationProps,
  InterceptOpenWindowProps,
  webviewUrlLog
} from '/app/domain/navigation/webviews/UrlModels'
import {
  isHttpOrHttps,
  openUrlWithOs
} from '/app/domain/navigation/webviews/UrlUtils'
import {
  showClouderyOffer,
  formatClouderyOfferUrlWithInAppPurchaseParams,
  isClouderyOfferUrl
} from '/app/domain/iap/services/clouderyOffer'

/**
 * Navigate to a given url.
 * @param webViewForwardRef - A ref object that will have the current WebView attached to it
 * @param url - The URL to navigate
 */
const navigateTo = (
  webViewForwardRef: React.RefObject<WebView>,
  url: string
): void => {
  webViewForwardRef.current?.injectJavaScript(`window.location.href = '${url}'`)
}

export const interceptNavigation = ({
  initialRequest,
  targetUri,
  subdomainType,
  navigation,
  onShouldStartLoadWithRequest,
  interceptReload,
  onReloadInterception,
  isFirstCall,
  client,
  setDownloadProgress,
  instanceInfo
}: InterceptNavigationProps): boolean => {
  if (isOauthClientLimitExceededUrl(initialRequest.url)) {
    showOauthClientsLimitExceeded(targetUri)
    return false
  }

  if (isClouderyOfferUrl(initialRequest.url, instanceInfo)) {
    const clouderyOfferUrlWithInAppPurchaseParams =
      formatClouderyOfferUrlWithInAppPurchaseParams(initialRequest.url)
    showClouderyOffer(clouderyOfferUrlWithInAppPurchaseParams)
    return false
  }

  const isPreviewableLink = checkIsPreviewableLink(initialRequest.url, client)
  // We don't want to intecerpt iframe navigation excepts for iOS and the download
  // Since we can download file from an iframe (intents)
  if (
    Platform.OS === 'ios' &&
    !initialRequest.isTopFrame &&
    !isPreviewableLink
  ) {
    return true
  }

  if (interceptReload) {
    const preventRefreshByDefault = isFirstCall
    const isReload = checkIsReload(initialRequest, preventRefreshByDefault)

    if (isReload) {
      webviewUrlLog.debug('Intercepting reload, remount component instead')
      onReloadInterception()
      return false
    }
  }

  if (isPreviewableLink) {
    const fileExtension = getFileExtentionFromCozyDownloadUrl(
      initialRequest.url,
      isPreviewableLink
    )
    if (Platform.OS === 'ios' || fileExtension === 'pdf') {
      safePromise(previewFileFromDownloadUrl)({
        downloadUrl: initialRequest.url,
        client,
        setDownloadProgress
      })
      return false
    } else {
      return true
    }
  }

  const newSlug = checkIsSlugSwitch({
    currentUrl: targetUri,
    destinationUrl: initialRequest.url,
    subdomainType
  })

  if (newSlug) {
    try {
      void navigateToApp({
        navigation,
        href: initialRequest.url,
        slug: newSlug
      })
    } catch (error) {
      webviewUrlLog.warn('Could not navigate to app', error)
    }

    return false
  }

  if (!isHttpOrHttps(initialRequest.url)) {
    safePromise(openUrlWithOs)(initialRequest.url)
    return false
  }

  const isRedirectOutside = checkIsRedirectOutside({
    currentUrl: targetUri,
    destinationUrl: initialRequest.url
  })

  if (isRedirectOutside) {
    openUrlInAppBrowser(initialRequest.url)
    return false
  }

  return onShouldStartLoadWithRequest(initialRequest)
}

export const interceptOpenWindow = ({
  currentUrl,
  destinationUrl,
  subdomainType,
  navigation,
  webViewForwardRef
}: InterceptOpenWindowProps): void => {
  const isSameApp = checkIsSameApp({
    currentUrl,
    destinationUrl,
    subdomainType
  })

  if (isSameApp) {
    navigateTo(webViewForwardRef, destinationUrl)
    return
  }

  const newSlug = checkIsSlugSwitch({
    currentUrl,
    destinationUrl,
    subdomainType
  })

  if (newSlug) {
    try {
      void navigateToApp({
        navigation,
        href: destinationUrl,
        slug: newSlug
      })
    } catch (error) {
      webviewUrlLog.warn('Could not navigate to app', error)
    }

    return
  }

  if (!isHttpOrHttps(destinationUrl)) {
    safePromise(openUrlWithOs)(destinationUrl)
    return
  }

  const isRedirectOutside = checkIsRedirectOutside({
    currentUrl,
    destinationUrl
  })

  if (isRedirectOutside) {
    openUrlInAppBrowser(destinationUrl)
    return
  }
}
