import React, { useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import Minilog from 'cozy-minilog'

import {
  handleAutofocusFields,
  tryProcessQueryKeyboardMessage
} from '/libs/functions/keyboardHelper'
import { NetService } from '/libs/services/NetService'
import { jsCozyGlobal } from '/components/webviews/jsInteractions/jsCozyInjection'
import { jsLogInterception } from '/components/webviews/jsInteractions/jsLogInterception'
import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { routes } from '/constants/routes'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'
import {
  fetchThemeOnLoad,
  tryProcessClouderyThemeMessage
} from '/screens/login/components/functions/clouderyThemeFetcher'
import { getOnboardingDataFromRequest } from '/screens/login/components/functions/getOnboardingDataFromRequest'
import { openWindowWithInAppBrowser } from '/screens/login/components/functions/interceptExternalLinks'
import { jsPaddingInjection } from '/screens/login/components/functions/webViewPaddingInjection'

const log = Minilog('ClouderyCreateInstanceView')

const run = `
  (function() {
    ${jsCozyGlobal()}

    ${jsLogInterception}

    ${fetchThemeOnLoad}
    
    ${handleAutofocusFields}

    ${jsPaddingInjection}

    return true;
  })();
`

/**
 * Displays the Cloudery web page where the user can onboard a new cozy from an onboarding email
 *
 * @param {object} props
 * @param {string} props.clouderyUrl - the onboarding URL as retrieve from the email's link
 * @param {startOnboarding} props.startOnboarding - method to call when onboarding redirection is intercepted by the webview
 * @param {import('/screens/login/components/functions/clouderyThemeFetcher').ClouderyTheme} props.clouderyTheme - The LoginScreen's theme (used for overlay)
 * @param {setClouderyTheme} props.setClouderyTheme - Set the LoginScreen's theme (used for overlay and local UI)
 * @returns {import('react').ComponentClass}
 */
export const ClouderyCreateInstanceView = ({
  clouderyUrl,
  startOnboarding,
  clouderyTheme,
  setClouderyTheme
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef()
  const { setOnboardedRedirection } = useHomeStateContext()

  const handleNavigation = request => {
    log.debug(`Navigation to ${request.url}`)
    const createdInstance = getOnboardingDataFromRequest(request)

    NetService.isOffline()
      .then(
        isOffline => isOffline && NetService.handleOffline(routes.onboarding)
      )
      .catch(error => log.error(error))

    if (request.loading) {
      if (createdInstance) {
        const { fqdn, registerToken, onboardedRedirection, magicCode } =
          createdInstance
        log.debug(`Intercept onboarding's password URL on ${fqdn}`)
        const normalizedFqdn = fqdn.toLowerCase()

        setOnboardedRedirection(onboardedRedirection ?? '')
        startOnboarding({
          fqdn: normalizedFqdn,
          magicCode: magicCode,
          registerToken: registerToken
        })

        return false
      }
    }

    return true
  }

  const processMessage = event => {
    tryProcessQueryKeyboardMessage(webviewRef.current, event)
    tryProcessClouderyThemeMessage(event, setClouderyTheme)
  }

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper
      style={{
        ...styles.view,
        backgroundColor: clouderyTheme.backgroundColor
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
          backgroundColor: clouderyTheme.backgroundColor
        }}
      />
      {loading && (
        <View
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: clouderyTheme.backgroundColor
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
