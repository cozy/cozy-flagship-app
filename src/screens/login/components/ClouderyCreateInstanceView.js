import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import Minilog from '@cozy/minilog'

import { getOnboardingDataFromRequest } from '/libs/functions/getOnboardingDataFromRequest'
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'
import { NetService } from '/libs/services/NetService'
import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '/components/webviews/jsInteractions/jsLogInterception'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { routes } from '/constants/routes'
import {
  fetchBackgroundOnLoad,
  tryProcessClouderyBackgroundMessage
} from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { openWindowWithInAppBrowser } from '/screens/login/components/functions/interceptExternalLinks'
import { parseOnboardedRedirectionForEmailScenario } from '/screens/login/components/functions/oidc'

const log = Minilog('ClouderyCreateInstanceView')

const run =
  `
    (function() {
      ${jsCozyGlobal()}

      ${jsLogInterception}

      return true;
    })();
  ` + fetchBackgroundOnLoad

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
  startOnboarding,
  backgroundColor,
  setBackgroundColor
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef()

  const handleNavigation = request => {
    const { fqdn, registerToken } = getOnboardingDataFromRequest(request)

    NetService.isOffline()
      .then(
        isOffline => isOffline && NetService.handleOffline(routes.onboarding)
      )
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

  const processMessage = event => {
    tryProcessClouderyBackgroundMessage(event, setBackgroundColor)
  }

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper
      style={{
        ...styles.view,
        backgroundColor: backgroundColor
      }}
      behavior="height"
    >
      <SupervisedWebView
        source={{ uri: clouderyUrl }}
        ref={webviewRef}
        onShouldStartLoadWithRequest={handleNavigation}
        onLoadEnd={() => setLoading(false)}
        onMessage={processMessage}
        onOpenWindow={openWindowWithInAppBrowser}
        injectedJavaScriptBeforeContentLoaded={run}
        style={{
          backgroundColor: backgroundColor
        }}
      />
      {loading && (
        <View
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: backgroundColor
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
