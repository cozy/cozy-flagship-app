import React, {useState, useEffect} from 'react'
import {WebView} from 'react-native-webview'
import Minilog from '@cozy/minilog'

const log = Minilog('CozyWebView')

Minilog.enable()

export const COZY_PREFIX = 'cozy://flagship'

const navigationMap = {
  'app=store': ({request, navigation}) =>
    navigation.push('store', {url: addRedirect(request.originalRequest.url)}),
  'konnector=(.*)': ({params, navigation}) =>
    navigation.push('home', {konnector: params[0]}),
}

const CozyWebView = (props) => {
  const {navigation, onShouldStartLoadWithRequest} = props
  const [flagshipRequest, setFlagshipRequest] = useState(null)

  useEffect(() => {
    if (flagshipRequest) {
      const {url, request} = flagshipRequest
      navigate({url, request, navigation})
    }
  }, [flagshipRequest, navigation])

  return (
    <WebView
      {...props}
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      onShouldStartLoadWithRequest={(initialRequest) => {
        const request = onShouldStartLoadWithRequest
          ? onShouldStartLoadWithRequest(initialRequest)
          : initialRequest
        if (request.url.substring(0, COZY_PREFIX.length) === COZY_PREFIX) {
          setFlagshipRequest({url: request.url, request})
          return false
        } else {
          return true
        }
      }}
    />
  )
}

function navigate({url, request, navigation}) {
  for (const regexp in navigationMap) {
    const match = url.match(escapeRegexp(COZY_PREFIX + '?') + regexp)
    if (match) {
      log.info(`url ${url} matches ${regexp} navigation rule`)
      return navigationMap[regexp]({
        navigation,
        params: match.slice(1),
        request,
      })
    }
  }

  log.warn(`url ${url} did not match any navigation rule`)
}

function escapeRegexp(string) {
  return string.replace(/[?\\/]/g, '\\$&')
}

function addRedirect(url) {
  const newUrl = new URL(url)
  newUrl.searchParams.append('konnector_open_uri', COZY_PREFIX)
  return newUrl.href
}

export default CozyWebView
