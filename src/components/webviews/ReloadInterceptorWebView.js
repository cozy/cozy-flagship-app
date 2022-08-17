import React, { useState } from 'react'
import { SupervisedWebView } from './SupervisedWebView'

import Minilog from '@cozy/minilog'

import { userAgentDefault } from '/constants/userAgent'

import {
  checkIsReload,
  checkIsRedirectOutside
} from '/libs/functions/urlHelpers'

const log = Minilog('CozyWebView')

Minilog.enable()

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
          const isRedirectOutside = checkIsRedirectOutside({
            currentUrl: targetUri,
            destinationUrl: initialRequest.url
          })

          if (isRedirectOutside) {
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
        const isReload = checkIsReload(initialRequest, preventRefreshByDefault)
        setPreventRefreshByDefault(false)

        if (isReload) {
          log.debug('Intercepting reload, remount component instead')
          setTimestamp(Date.now())
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
      }}
    />
  )
})

ReloadInterceptorWebView.displayName = 'ReloadInterceptorWebView'
export default ReloadInterceptorWebView
