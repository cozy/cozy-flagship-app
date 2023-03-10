import React, { useState } from 'react'
import { Platform } from 'react-native'

import { useClient } from 'cozy-client'

import { SupervisedWebView } from './SupervisedWebView'

import Minilog from '@cozy/minilog'

import { userAgentDefault } from '../../core/constants/userAgent'
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
import { ProgressContainer } from '../ProgressContainer'

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
  client,
  setDownloadProgress
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

  const isPreviewableLink = checkIsPreviewableLink(initialRequest.url, client)

  if (isPreviewableLink) {
    const fileExtension = getFileExtentionFromCozyDownloadUrl(
      initialRequest.url,
      isPreviewableLink
    )
    if (Platform.OS === 'ios' || fileExtension === 'pdf') {
      previewFileFromDownloadUrl({
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
    openUrlInAppBrowser(initialRequest.url)
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

  const [progress, setDownloadProgress] = useState(0)

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
      <ProgressContainer progress={progress}>
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
              client,
              setDownloadProgress
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
      </ProgressContainer>
    )
  }

  return (
    <ProgressContainer progress={progress}>
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
            client,
            setDownloadProgress
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
    </ProgressContainer>
  )
})

ReloadInterceptorWebView.displayName = 'ReloadInterceptorWebView'
export default ReloadInterceptorWebView
