import React, {useState, useEffect, useMemo} from 'react'
import {WebView} from 'react-native-webview'
import {CommonActions} from '@react-navigation/native'
import Minilog from '@cozy/minilog'
import {generateWebLink} from 'cozy-ui/transpiled/react/AppLinker'
import {useClient} from 'cozy-client'
import * as RootNavigation from '../libs/RootNavigation.js'

const log = Minilog('CozyWebView')

Minilog.enable()

export const COZY_PREFIX = 'cozy://flagship'

const navigationMap = {
  'app=store': ({request}) =>
    RootNavigation.navigate('cozyapp', {
      href: addRedirect(request.originalRequest.url),
    }),
  'konnector=(.*)': ({params, navigation}) => {
    navigation.dispatch(
      // navigate directly to home without creating a new view
      CommonActions.navigate({name: 'home', params: {konnector: params[0]}}),
    )
  },
}

const CozyWebView = ({
  navigation,
  onShouldStartLoadWithRequest,
  setRef,
  ...rest
}) => {
  const [flagshipRequest, setFlagshipRequest] = useState(null)
  const client = useClient()
  const {uri} = client.getStackClient()

  useEffect(() => {
    if (flagshipRequest) {
      const {url, request} = flagshipRequest
      navigate({url, request, navigation})
    }
  }, [flagshipRequest, navigation])

  const storeAddUrl = useMemo(() => {
    const {subdomain: subDomainType} = client.getInstanceOptions()
    return generateWebLink({
      cozyUrl: new URL(uri).origin,
      slug: 'store',
      subDomainType,
    })
  }, [client, uri])

  const run = `
    (function() { 
      window.cozy = {
        isFlagshipApp: "true",
        ClientConnectorLauncher: "react-native",
      };
      return true;
    })();
  `

  return (
    <WebView
      {...rest}
      injectedJavaScriptBeforeContentLoaded={run}
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      ref={ref => setRef?.(ref)}
      onShouldStartLoadWithRequest={initialRequest => {
        // we use onShouldStartLoadWithRequest since links to cozy://flagship in the webview do not
        // trigger deep linking
        let request = onShouldStartLoadWithRequest
          ? onShouldStartLoadWithRequest(initialRequest)
          : initialRequest

        request = interceptStoreUrls({request, storeAddUrl})

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

function isStoreUrl({url, storeAddUrl}) {
  return url.includes(storeAddUrl.split('#').shift())
}

function interceptStoreUrls({request, storeAddUrl}) {
  if (isStoreUrl({url: request.url, storeAddUrl})) {
    return {
      ...request,
      url: `${COZY_PREFIX}?app=store`,
      originalRequest: request,
    }
  }
  return request
}

export default CozyWebView
