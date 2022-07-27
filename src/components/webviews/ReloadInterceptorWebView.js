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

const interceptReload = (url, targetUri, preventRefreshByDefault) => {
  const realUrl = url === 'about:blank' ? targetUri : url
  const rootUrl = formatUrlToCompare(realUrl)
  const rootBaseUrl = formatUrlToCompare(targetUri)

  if (rootUrl === rootBaseUrl) {
    // Return false, except on iOS on first render because onShouldStartLoadWithRequest is called
    return !(Platform.OS === 'ios' && preventRefreshByDefault)
  } else {
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
    onMessage,
    userAgent = userAgentDefault
  } = props

  if (!source.html) {
    // Blocking this feature, when source={{ uri }} is set
    return <SupervisedWebView {...props} ref={ref} {...userAgent} />
  }

  return (
    <SupervisedWebView
      {...props}
      {...userAgent}
      ref={ref}
      key={timestamp}
      onShouldStartLoadWithRequest={initialRequest => {
        const stopPageReload = interceptReload(
          initialRequest.url,
          targetUri,
          preventRefreshByDefault
        )
        // After first render iOS, refresh interception is enabled
        setPreventRefreshByDefault(stopPageReload)
        if (stopPageReload) {
          setTimestamp(Date.now())
          return false
        }
        return onShouldStartLoadWithRequest(initialRequest)
      }}
      onMessage={async m => {
        // Handling manual redirection Android see jsOnbeforeunload
        const { data: rawData } = m.nativeEvent
        const dataPayload = JSON.parse(rawData)
        if (dataPayload.type === 'intercept-reload') {
          if (preventRefreshByDefault) {
            setTimestamp(Date.now())
          }
          // Prevent infinite refresh, after one refresh
          setPreventRefreshByDefault(!preventRefreshByDefault)
        }

        return onMessage(m)
      }}
    />
  )
})

ReloadInterceptorWebView.displayName = 'ReloadInterceptorWebView'
export default ReloadInterceptorWebView
