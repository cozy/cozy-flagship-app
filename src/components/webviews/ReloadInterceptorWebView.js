import React, { useState } from 'react'

import { useClient } from 'cozy-client'

import { SupervisedWebView } from './SupervisedWebView'

import Minilog from '@cozy/minilog'

import { userAgentDefault } from '/constants/userAgent'

import { navigateToApp } from '/libs/functions/openApp'
import {
  checkIsReload,
  checkIsRedirectOutside,
  checkIsSlugSwitch
} from '/libs/functions/urlHelpers'

const log = Minilog('ReloadInterceptorWebView')

Minilog.enable()

const interceptNavigation = ({
  initialRequest,
  targetUri,
  subdomainType,
  navigation,
  onShouldStartLoadWithRequest,
  interceptReload,
  onReloadInterception,
  isFirstCall
}) => {
  if (interceptReload) {
    const preventRefreshByDefault = isFirstCall
    const isReload = checkIsReload(initialRequest, preventRefreshByDefault)

    if (isReload) {
      log.debug('Intercepting reload, remount component instead')
      onReloadInterception()
      return false
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
    return false
  }

  return onShouldStartLoadWithRequest(initialRequest)
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
            interceptReload: false
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
          isFirstCall
        })
      }}
    />
  )
})

ReloadInterceptorWebView.displayName = 'ReloadInterceptorWebView'
export default ReloadInterceptorWebView
