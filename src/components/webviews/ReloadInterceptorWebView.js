import React, { useState } from 'react'

import { useClient } from 'cozy-client'

import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { userAgentDefault } from '/constants/userAgent'
import { ProgressContainer } from '/components/ProgressContainer'
import {
  interceptNavigation,
  interceptOpenWindow
} from '/app/domain/navigation/webviews/UrlService'

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
