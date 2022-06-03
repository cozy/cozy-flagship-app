import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

import Minilog from '@cozy/minilog'

import { getOnboardingDataFromRequest } from '/libs/functions/getOnboardingDataFromRequest'
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'

import { NetService } from '/libs/services/NetService'
import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '/components/webviews/jsInteractions/jsLogInterception'

import { getColors } from '/theme/colors'

const log = Minilog('ClouderyCreateInstanceView')

const run = `
    (function() {
      ${jsCozyGlobal()}

      ${jsLogInterception}

      return true;
    })();
  `

/**
 * Displays the Cloudery web page where the user can onboard a new cozy from an onboarding email
 *
 * @param {object} props
 * @param {string} props.clouderyUrl - the onboarding URL as retrieve from the email's link
 * @param {startOnboarding} props.startOnboarding - method to call when onboarding redirection is intercepted by the webview
 * @returns {import('react').ComponentClass}
 */
export const ClouderyCreateInstanceView = ({
  clouderyUrl,
  startOnboarding
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef()
  const colors = getColors()

  const handleNavigation = request => {
    const { fqdn, registerToken } = getOnboardingDataFromRequest(request)

    NetService.isOffline()
      .then(isOffline => isOffline && NetService.handleOffline())
      .catch(error => log.error(error))

    if (request.loading) {
      if (fqdn && registerToken) {
        log.debug(`Intercept onboarding's password URL on ${fqdn}`)
        const normalizedFqdn = fqdn.toLowerCase()

        startOnboarding({
          fqdn: normalizedFqdn,
          registerToken
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
        source={{ uri: clouderyUrl }}
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
    flex: 1,
    backgroundColor: getColors().primaryColor
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})
