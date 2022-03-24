import React, {useState} from 'react'
import {View, StyleSheet} from 'react-native'
import {WebView} from 'react-native-webview'

import {getHtml} from './assets/TwoFactorAuthentication/htmlTwoFactorAuthentication'

/**
 * Show a 2FA form that asks the user for their 2FA code received my email/authenticator
 *
 * @param {object} props
 * @param {string} props.errorMessage - Error message to display if defined
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {setTwoFactorCode} props.setTwoFactorCode - Function to call to set the user's 2FA code
 * @returns {import('react').ComponentClass}
 */
export const TwoFactorAuthenticationView = ({
  errorMessage,
  goBack,
  instance,
  setTwoFactorCode,
}) => {
  const [loading, setLoading] = useState(true)

  const html = getHtml(instance, errorMessage)

  const processMessage = event => {
    if (event.nativeEvent && event.nativeEvent.data) {
      const message = JSON.parse(event.nativeEvent.data)
      if (message.message === 'setTwoFactorAuthenticationCode') {
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
