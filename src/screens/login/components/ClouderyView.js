import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

import Minilog from '@cozy/minilog'

import strings from '../../../strings.json'
import { getColors } from '../../../theme/colors'
import { getUriFromRequest } from '../../../libs/functions/getUriFromRequest'
import { setFocusOnWebviewField } from '../../../libs/functions/keyboardHelper'
import { NetService } from '../../../libs/services/NetService'
import { jsCozyGlobal } from '../../../components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '../../../components/webviews/jsInteractions/jsLogInterception'

const log = Minilog('ClouderyView')

const isLoginPage = requestUrl => {
  const url = new URL(requestUrl)

  return url.pathname === '/v2/cozy/login'
}

const isOnboardPage = requestUrl => {
  const url = new URL(requestUrl)

  return url.pathname === '/v2/cozy/onboard'
}

const run = `
    (function() {
      ${jsCozyGlobal()}

      ${jsLogInterception}

      return true;
    })();
  `

/**
 * Displays the Cloudery web page where the user can specify their Cozy instance
 *
 * If the user clicks on `Continue` then the instance data is returned to parent component
 * through `setInstanceData()`
 *
 * If the user clicks on `I haven't a Cozy` then the user is redirected to `OnboardingScreen`
 *
 * @param {object} props
 * @param {setInstanceData} props.setInstanceData
 * @returns {import('react').ComponentClass}
 */
export const ClouderyView = ({ setInstanceData }) => {
  const [uri, setUri] = useState(strings.loginUri)
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef()
  const colors = getColors()

  const handleNavigation = request => {
    NetService.isOffline()
      .then(isOffline => isOffline && NetService.handleOffline())
      .catch(error => log.error(error))

    if (request.loading) {
      if (isLoginPage(request.url) && request.url !== strings.loginUri) {
        setUri(strings.loginUri)
        return false
      }

      if (isOnboardPage(request.url) && request.url !== strings.onboardingUri) {
        setUri(strings.onboardingUri)
        return false
      }

      const instance = getUriFromRequest(request)
      if (instance) {
        const normalizedInstance = instance.toLowerCase()
        const fqdn = new URL(normalizedInstance).host
        setInstanceData({
          instance: normalizedInstance,
          fqdn
        })
        return false
      }
    }

    return true
  }

  useEffect(() => {
    if (webviewRef && !loading) {
      setFocusOnWebviewField(webviewRef.current, 'slug')
    }
  }, [loading, webviewRef])

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper style={styles.view} behavior="height">
      <WebView
        source={{ uri: uri }}
        ref={webviewRef}
        onShouldStartLoadWithRequest={handleNavigation}
        onLoadEnd={() => setLoading(false)}
        injectedJavaScriptBeforeContentLoaded={run}
        style={{
          backgroundColor: colors.primaryColor
        }}
      />
      {loading && (
        <View
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: colors.primaryColor
            }
          ]}
        />
      )}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})
