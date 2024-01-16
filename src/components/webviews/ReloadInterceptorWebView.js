import React, { useState } from 'react'

import { useClient, useInstanceInfo } from 'cozy-client'

import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { APPLICATION_NAME_FOR_USER_AGENT } from '/constants/userAgent'
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
  const instanceInfo = useInstanceInfo()

  const [progress, setDownloadProgress] = useState(0)

  const { targetUri, source, onShouldStartLoadWithRequest, navigation } = props

  if (!source.html) {
    // Blocking this feature, when source={{ uri }} is set
    return (
      <ProgressContainer progress={progress}>
        <SupervisedWebView
          {...props}
          applicationNameForUserAgent={APPLICATION_NAME_FOR_USER_AGENT}
          ref={ref}
          onShouldStartLoadWithRequest={initialRequest => {
            return interceptNavigation({
              initialRequest,
              targetUri,
              subdomainType,
              navigation,
              onShouldStartLoadWithRequest,
              interceptReload: false,
              client,
              setDownloadProgress,
              instanceInfo
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
        applicationNameForUserAgent={APPLICATION_NAME_FOR_USER_AGENT}
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
            onReloadInterception: () => {
              if (props.reloadProxyWebView) {
                props.reloadProxyWebView()
              } else {
                setTimestamp(Date.now())
              }
            },
            isFirstCall,
            client,
            setDownloadProgress,
            instanceInfo
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
