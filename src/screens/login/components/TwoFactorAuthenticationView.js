import React, {useEffect, useRef, useState} from 'react'
import {View, StyleSheet} from 'react-native'
import {WebView} from 'react-native-webview'

import {getHtml} from './assets/TwoFactorAuthentication/htmlTwoFactorAuthentication'

/**
 * Show a 2FA form that asks the user for their 2FA code received by email/authenticator
 *
 * @param {object} props
 * @param {string} [props.errorMessage] - Error message to display if defined
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {boolean} props.readonly - Specify if the form should be readonly
 * @param {setReadonly} props.setReadonly - Trigger change on the readonly state
 * @param {setTwoFactorCode} props.setTwoFactorCode - Function to call to set the user's 2FA code
 * @returns {import('react').ComponentClass}
 */
export const TwoFactorAuthenticationView = ({
  errorMessage,
  goBack,
  instance,
  readonly,
  setReadonly,
  setTwoFactorCode,
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef()

  useEffect(() => {
    if (webviewRef) {
      const payload = JSON.stringify({
        message: 'setReadonly',
        param: readonly,
      })

      const webView = webviewRef.current
      webView.postMessage(payload)
    }
  }, [webviewRef, readonly])

  const html = getHtml(instance, errorMessage)

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

  return (
    <View style={styles.view}>
      <WebView
        ref={webviewRef}
        javaScriptEnabled={true}
        onMessage={processMessage}
        originWhitelist={['*']}
        source={{html}}
      />
      {loading && <View style={styles.loadingOverlay} />}
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#297ef2',
  },
})
