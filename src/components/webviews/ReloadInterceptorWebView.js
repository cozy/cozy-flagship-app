import React, { useState } from 'react'
import { SupervisedWebView } from './SupervisedWebView'

import Minilog from '@cozy/minilog'

import { userAgentDefault } from '/constants/userAgent'

import {
  checkIsReload,
  checkIsRedirectOutside
} from '/libs/functions/urlHelpers'

const log = Minilog('ReloadInterceptorWebView')

Minilog.enable()

const interceptNavigation = ({
  initialRequest,
  targetUri,
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

  const {
    targetUri,
    source,
    onShouldStartLoadWithRequest,
    userAgent = userAgentDefault
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
