import React, { useState } from 'react'
import { Platform } from 'react-native'
import { SupervisedWebView } from './SupervisedWebView'

import Minilog from '@cozy/minilog'

import { userAgentDefault } from '/constants/userAgent'

const log = Minilog('CozyWebView')

Minilog.enable()

const formatUrlToCompare = url => {
  const { host, pathname } = new URL(url)
  return `http://${host}${pathname}`
}

const detectReload = (initialRequest, preventRefreshByDefault) => {
  const { navigationType } = initialRequest

  if (Platform.OS === 'ios' && preventRefreshByDefault) {
    return false
  }

  if (navigationType === 'reload') {
    return true
  }

  return false
}

const isRedirectOutside = (url, targetUri) => {
  const realUrl = url === 'about:blank' ? targetUri : url
  const rootUrl = formatUrlToCompare(realUrl)
  const rootBaseUrl = formatUrlToCompare(targetUri)

  if (rootUrl !== rootBaseUrl) {
    log.error(
      `ReloadInterceptorWebView blocks. Current URL was:${rootBaseUrl} and destination URL was: ${rootUrl}`
    )
    return true
  }
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
          const isRedirect = isRedirectOutside(initialRequest.url, targetUri)

          if (isRedirect) {
            return false
          }

          return onShouldStartLoadWithRequest(initialRequest)
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
        const isReload = detectReload(initialRequest, preventRefreshByDefault)
        setPreventRefreshByDefault(false)

        if (isReload) {
          log.debug('Intercepting reload, remount component instead')
          setTimestamp(Date.now())
          return false
        }

        const isRedirect = isRedirectOutside(initialRequest.url, targetUri)

        if (isRedirect) {
          return false
        }

        return onShouldStartLoadWithRequest(initialRequest)
      }}
    />
  )
})

ReloadInterceptorWebView.displayName = 'ReloadInterceptorWebView'
export default ReloadInterceptorWebView
