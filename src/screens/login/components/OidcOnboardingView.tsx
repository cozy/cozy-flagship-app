import Minilog from '@cozy/minilog'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import { SupervisedWebView } from '/components/webviews/SupervisedWebView'

import { parseOidcOnboardingFinishedUrl } from './functions/oidc'

import { NetService } from '/libs/services/NetService'
import { routes } from '/constants/routes'

const log = Minilog('OidcOnboardingView')

interface ClouderyWebViewProps {
  code: string
  onboardUrl: string
  startOidcOAuth: (fqdn: string, code: string) => void
}

/**
 * Display a WebView with specidied 'onboardUrl' and call startOidcOauth when
 * navigation to OIDCInstanceCreationResult url occurs
 */
export const OidcOnboardingView = ({
  code,
  onboardUrl,
  startOidcOAuth
}: ClouderyWebViewProps): JSX.Element => {
  const [loading, setLoading] = useState(true)
  const [displayOverlay, setDisplayOverlay] = useState(true)

  const handleNavigation = (request: WebViewNavigation): boolean => {
    const createdInstance = parseOidcOnboardingFinishedUrl(request)
    if (createdInstance) {
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

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper style={styles.view} behavior="height">
      <SupervisedWebView
        source={{ uri: onboardUrl }}
        onShouldStartLoadWithRequest={handleNavigation}
        onLoadEnd={(): void => setLoading(false)}
        style={{
          backgroundColor: '#4b4b4b'
        }}
        onError={handleError}
      />
      {displayOverlay && (
        <View
          testID="oidcWebViewOverlay"
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: '#4b4b4b'
            }
          ]}
        />
      )}
    </Wrapper>
  )
}

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
