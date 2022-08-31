import React, { useState } from 'react'
import { Platform } from 'react-native'

import { useClient } from 'cozy-client'

import { SupervisedWebView } from './SupervisedWebView'

import Minilog from '@cozy/minilog'

import { userAgentDefault } from '/constants/userAgent'

import { navigateToApp } from '/libs/functions/openApp'
import {
  checkIsCozyDownloadLink,
  checkIsReload,
  checkIsRedirectOutside,
  checkIsSameApp,
  checkIsSlugSwitch,
  openUrlInAppBrowser
} from '/libs/functions/urlHelpers'

import { previewFileFromDownloadUrl } from '/libs/functions/filePreviewHelper'
const log = Minilog('ReloadInterceptorWebView')

Minilog.enable()

const navigateTo = (webViewForwardRef, url) => {
  webViewForwardRef(webView => {
    webView.injectJavaScript(`window.location.href = '${url}'`)
  })
}

const interceptNavigation = ({
  initialRequest,
  targetUri,
  subdomainType,
  navigation,
  onShouldStartLoadWithRequest,
  interceptReload,
  onReloadInterception,
  isFirstCall,
  client
}) => {
  if (Platform.OS === 'ios' && !initialRequest.isTopFrame) {
    return true
  }

  if (interceptReload) {
    const preventRefreshByDefault = isFirstCall
    const isReload = checkIsReload(initialRequest, preventRefreshByDefault)

    if (isReload) {
      log.debug('Intercepting reload, remount component instead')
      onReloadInterception()
      return false
    }
  }

  const isCozyDownloadLink = checkIsCozyDownloadLink({
    currentUrl: targetUri,
    destinationUrl: initialRequest.url,
    subdomainType
  })

  if (isCozyDownloadLink) {
    if (Platform.OS === 'ios') {
      previewFileFromDownloadUrl({
        downloadUrl: initialRequest.url,
        client
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
    navigateToApp({
      navigation,
      href: initialRequest.url,
      slug: newSlug
    })
    return false
  }

  const isRedirectOutside = checkIsRedirectOutside({
    currentUrl: targetUri,
    destinationUrl: initialRequest.url
  })

  if (isRedirectOutside) {
    openUrlInAppBrowser(targetUri)
    return false
  }

  return onShouldStartLoadWithRequest(initialRequest)
}

const interceptOpenWindow = ({
  currentUrl,
  destinationUrl,
  subdomainType,
  navigation,
  webViewForwardRef
}) => {
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
    navigateToApp({
      navigation,
      href: destinationUrl,
      slug: newSlug
    })
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

const ReloadInterceptorWebView = React.forwardRef((props, ref) => {
  const [preventRefreshByDefault, setPreventRefreshByDefault] = useState(true)
  const [timestamp, setTimestamp] = useState(Date.now())
  const client = useClient()
  const subdomainType = client.capabilities?.flat_subdomains ? 'flat' : 'nested'

  const {
    targetUri,
    source,
    onShouldStartLoadWithRequest,
    userAgent = userAgentDefault,
    navigation
  } = props

  if (!source.html) {
    // Blocking this feature, when source={{ uri }} is set
    return (
      <SupervisedWebView
        {...props}
        ref={ref}
        {...userAgent}
        onShouldStartLoadWithRequest={initialRequest => {
          return interceptNavigation({
            initialRequest,
            targetUri,
            subdomainType,
            navigation,
            onShouldStartLoadWithRequest,
            interceptReload: false,
            client
          })
        }}
        onOpenWindow={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          interceptOpenWindow({
            destinationUrl: nativeEvent.targetUrl,
            currentUrl: targetUri,
            subdomainType,
            navigation,
            webViewForwardRef: ref
          })
        }}
      />
    )
  }

  return (
    <SupervisedWebView
      {...props}
      {...userAgent}
      ref={ref}
      key={timestamp}
      onShouldStartLoadWithRequest={initialRequest => {
        const isFirstCall = preventRefreshByDefault
        setPreventRefreshByDefault(false)

        return interceptNavigation({
          initialRequest,
          targetUri,
          subdomainType,
          navigation,
          onShouldStartLoadWithRequest,
          interceptReload: true,
          onReloadInterception: () => setTimestamp(Date.now()),
          isFirstCall,
          client
        })
      }}
      onOpenWindow={syntheticEvent => {
        const { nativeEvent } = syntheticEvent
        interceptOpenWindow({
          destinationUrl: nativeEvent.targetUrl,
          currentUrl: targetUri,
          subdomainType,
          navigation,
          webViewForwardRef: ref
        })
      }}
    />
  )
})

ReloadInterceptorWebView.displayName = 'ReloadInterceptorWebView'
export default ReloadInterceptorWebView
