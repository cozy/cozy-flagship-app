import Minilog from 'cozy-minilog'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from 'react-native'
import type {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation
} from 'react-native-webview'

import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { routes } from '/constants/routes'
import { NetService } from '/libs/services/NetService'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'
import {
  fetchThemeOnLoad,
  tryProcessClouderyThemeMessage
} from '/screens/login/components/functions/clouderyThemeFetcher'
import type { ClouderyTheme } from '/screens/login/components/functions/clouderyThemeFetcher'
import { getOnboardingDataFromRequest } from '/screens/login/components/functions/getOnboardingDataFromRequest'
import { openWindowWithInAppBrowser } from '/screens/login/components/functions/interceptExternalLinks'
import { jsPaddingInjection } from '/screens/login/components/functions/webViewPaddingInjection'

const log = Minilog('OidcOnboardingView')

interface ClouderyWebViewProps {
  clouderyTheme: ClouderyTheme
  code: string
  onboardUrl: string
  setClouderyTheme: (theme: ClouderyTheme) => void
  startOidcOAuth: (fqdn: string, code: string) => void
}

/**
 * Display a WebView with specidied 'onboardUrl' and call startOidcOauth when
 * navigation to OIDCInstanceCreationResult url occurs
 */
export const OidcOnboardingView = ({
  clouderyTheme,
  code,
  onboardUrl,
  setClouderyTheme,
  startOidcOAuth
}: ClouderyWebViewProps): JSX.Element => {
  const [loading, setLoading] = useState(true)
  const [displayOverlay, setDisplayOverlay] = useState(true)
  const webviewRef = useRef<WebView>()
  const [canGoBack, setCanGoBack] = useState(false)
  const { setOnboardedRedirection } = useHomeStateContext()

  const handleNavigation = (request: WebViewNavigation): boolean => {
    log.debug(`Navigation to ${request.url}`)
    const createdInstance = getOnboardingDataFromRequest(request)
    if (createdInstance) {
      setOnboardedRedirection(createdInstance.onboardedRedirection ?? '')
      startOidcOAuth(createdInstance.fqdn, code)
      return false
    }

    return true
  }

  useEffect(() => {
    // Wait 1ms before hiding overlay to prevent screen flickering
    if (!loading) {
      setTimeout(() => {
        setDisplayOverlay(false)
      }, 1)
    }
  }, [loading])

  const handleBackPress = useCallback(() => {
    if (!canGoBack) {
      return false
    }

    webviewRef.current?.goBack()
    return true
  }, [canGoBack, webviewRef])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    )

    return () => backHandler.remove()
  }, [handleBackPress])

  const processMessage = (event: WebViewMessageEvent): void => {
    tryProcessClouderyThemeMessage(event, setClouderyTheme)
  }

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper style={styles.view} behavior="height">
      <SupervisedWebView
        source={{ uri: onboardUrl }}
        ref={webviewRef}
        injectedJavaScriptBeforeContentLoaded={run}
        onShouldStartLoadWithRequest={handleNavigation}
        onLoadEnd={(): void => setLoading(false)}
        onMessage={processMessage}
        onNavigationStateChange={(event: WebViewNavigation): void => {
          setCanGoBack(event.canGoBack)
        }}
        onOpenWindow={openWindowWithInAppBrowser}
        style={{
          backgroundColor: clouderyTheme.backgroundColor
        }}
        onError={handleError}
      />
      {displayOverlay && (
        <View
          testID="oidcWebViewOverlay"
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

const run = `
  (function() {
    ${fetchThemeOnLoad}

    ${jsPaddingInjection}

    return true;
  })();
`

const handleError = async (webviewErrorEvent: unknown): Promise<void> => {
  try {
    const isOffline = await NetService.isOffline()
    isOffline && NetService.handleOffline(routes.onboarding)
  } catch (error) {
    log.error(error)
  } finally {
    log.error(webviewErrorEvent)
  }
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
    bottom: 0,
    zIndex: 10
  }
})
