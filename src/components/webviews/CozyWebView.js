import React, {useState, useEffect, useMemo} from 'react'
import {WebView} from 'react-native-webview'
import {CommonActions} from '@react-navigation/native'

import Minilog from '@cozy/minilog'
import {generateWebLink} from 'cozy-ui/transpiled/react/AppLinker'
import {useClient} from 'cozy-client'
import {useNativeIntent} from 'cozy-intent'

import * as RootNavigation from '../../libs/RootNavigation.js'
import {useSession} from '../../hooks/useSession.js'
import strings from '../../strings.json'

const log = Minilog('CozyWebView')

Minilog.enable()

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
  onMessage: parentOnMessage,
  ...rest
}) => {
  const [ref, setRef] = useState('')
  const nativeIntent = useNativeIntent()

  const [flagshipRequest, setFlagshipRequest] = useState(null)
  const client = useClient()
  const {uri: clientUri} = client.getStackClient()
  const {shouldInterceptAuth, handleInterceptAuth, consumeSessionToken} =
    useSession()
  const [uri, setUri] = useState()

  useEffect(() => {
    if (ref) {
      nativeIntent.registerWebview(ref)
    }

    return () => {
      if (ref) {
        nativeIntent.unregisterWebview(ref)
      }
    }
  }, [nativeIntent, ref])

  useEffect(() => {
    if (flagshipRequest) {
      const {url, request} = flagshipRequest
      navigate({url, request, navigation})
    }
  }, [flagshipRequest, navigation])
  const run = `
    (function() { 
      window.cozy = {
        isFlagshipApp: "true",
        ClientConnectorLauncher: "react-native",
      };
      return true;
    })();
  `

  return uri ? (
    <WebView
      {...rest}
      source={{uri}}
      injectedJavaScriptBeforeContentLoaded={run}
      originWhitelist={['*']}
      useWebKit={true}
      javaScriptEnabled={true}
      ref={ref => setRef(ref)}
      onShouldStartLoadWithRequest={initialRequest => {
        if (shouldInterceptAuth(initialRequest.url)) {
          const asyncRedirect = async () => {
            const authLink = await handleInterceptAuth(initialRequest.url)
            await consumeSessionToken()
            setUri(authLink)
          }

          asyncRedirect()
          return false
        }

        // we use onShouldStartLoadWithRequest since links to cozy://flagship in the webview do not
        // trigger deep linking
        let request = onShouldStartLoadWithRequest
          ? onShouldStartLoadWithRequest(initialRequest)
          : initialRequest

        if (request.url.substring(0, COZY_PREFIX.length) === COZY_PREFIX) {
          setFlagshipRequest({url: request.url, request})
          return false
        } else {
          return true
        }
      }}
      onMessage={async m => {
        nativeIntent.tryEmit(m)

        if (parentOnMessage) {
          parentOnMessage(m)
        }
      }}
    />
  ) : null
}

function navigate({url, request, navigation}) {
  for (const regexp in navigationMap) {
    const match = url.match(escapeRegexp(strings.COZY_SCHEME + '?') + regexp)
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
  newUrl.searchParams.append('konnector_open_uri', strings.COZY_SCHEME)
  return newUrl.href
}
export default CozyWebView
