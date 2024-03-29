import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native'

import { getHtml } from './assets/TwoFactorAuthentication/htmlTwoFactorAuthentication'

import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'

/**
 * Show a 2FA form that asks the user for their 2FA code received by email/authenticator
 *
 * @param {object} props
 * @param {import('/screens/login/components/functions/clouderyThemeFetcher').ClouderyTheme} props.clouderyTheme - The LoginScreen's theme (used for overlay)
 * @param {string} [props.errorMessage] - Error message to display if defined
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {boolean} props.readonly - Specify if the form should be readonly
 * @param {setReadonly} props.setReadonly - Trigger change on the readonly state
 * @param {setTwoFactorCode} props.setTwoFactorCode - Function to call to set the user's 2FA code
 * @returns {import('react').ComponentClass}
 */
export const TwoFactorAuthenticationView = ({
  clouderyTheme,
  errorMessage,
  goBack,
  instance,
  readonly,
  setReadonly,
  setTwoFactorCode
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef()

  useEffect(() => {
    if (webviewRef) {
      const payload = JSON.stringify({
        message: 'setReadonly',
        param: readonly
      })

      const webView = webviewRef.current
      webView.postMessage(payload)
    }
  }, [webviewRef, readonly])

  useEffect(() => {
    if (webviewRef && !loading) {
      setFocusOnWebviewField(webviewRef.current, 'two-factor-passcode')
    }
  }, [loading, webviewRef])

  const html = getHtml(instance, clouderyTheme, errorMessage)

  const processMessage = event => {
    if (event.nativeEvent && event.nativeEvent.data) {
      const message = JSON.parse(event.nativeEvent.data)
      if (message.message === 'setTwoFactorAuthenticationCode') {
        setReadonly(true)
        setTwoFactorCode(message.twoFactorAuthenticationCode)
      } else if (message.message === 'backButton') {
        goBack()
      } else if (message.message === 'loaded') {
        setLoading(false)
      }
    }
  }

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper style={styles.view} behavior="height">
      <SupervisedWebView
        ref={webviewRef}
        javaScriptEnabled={true}
        onMessage={processMessage}
        originWhitelist={['*']}
        source={{ html }}
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
