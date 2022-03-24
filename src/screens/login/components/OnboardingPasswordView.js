import React, {useEffect, useState} from 'react'
import {View, StyleSheet} from 'react-native'
import {WebView} from 'react-native-webview'

import {doHashPassword} from '../../../libs/functions/passwordHelpers'

import {getHtml} from './assets/OnboardingPasswordView/htmlOnboardingPasswordInjection'

/**
 * Show a password form that asks the user their password and hint
 * When the user validate their password, the password and the salt are sent back to parent
 * by calling `setPasswordData`
 *
 * @param {object} props
 * @param {string} props.errorMessage - Error message to display if defined
 * @param {string} props.fqdn - The Cozy's fqdn
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {setPasswordData} props.setPasswordData - Function to call to set the user's password
 * @returns {import('react').ComponentClass}
 */
const PasswordForm = ({
  errorMessage,
  fqdn,
  instance,
  goBack,
  setPasswordData,
}) => {
  const [loading, setLoading] = useState(true)

  const html = getHtml(instance, errorMessage)

  const setLoaded = () => {
    setLoading(false)
  }

  const setPassword = (passphrase, hint) => {
    setPasswordData({
      password: passphrase,
      hint: hint,
    })
  }

  const processMessage = event => {
    if (event.nativeEvent && event.nativeEvent.data) {
      const message = JSON.parse(event.nativeEvent.data)

      if (message.message === 'loaded') {
        setLoaded()
      } else if (message.message === 'setPassphrase') {
        setPassword(message.passphrase, message.hint)
      } else if (message.message === 'backButton') {
        goBack()
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

/**
 * Show a password view that asks the user their password and hint
 * When the user validate their password, the password is hashed and is send back to parent
 * with corresponding cryptographic keys by calling `setKeys`
 * If an error occurs, then `setError` is called
 *
 * @param {object} props
 * @param {string} props.errorMessage - Error message to display if defined
 * @param {string} props.fqdn - The Cozy's fqdn
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {number} [props.kdfIterations] - The number of KDF iterations to be used for hashing the password
 * @param {setErrorCallback} props.setError - Function to call when an error is thrown by the component
 * @param {setLoginDataCallback} props.setKeys - Function to call to set the user's password and encryption keys
 * @returns {import('react').ComponentClass}
 */
export const OnboardingPasswordView = ({
  errorMessage,
  fqdn,
  goBack,
  instance,
  kdfIterations,
  setError,
  setKeys,
}) => {
  const [passwordData, setPasswordData] = useState()

  useEffect(() => {
    if (passwordData) {
      doHashPassword(passwordData, fqdn, kdfIterations)
        .then(result => {
          setPasswordData(undefined)
          setKeys(result)
        })
        .catch(error => {
          setError('Impossible to hash the password', error)
        })
    }
  }, [passwordData, fqdn, setKeys, setError, kdfIterations])

  return (
    <PasswordForm
      errorMessage={errorMessage}
      fqdn={fqdn}
      goBack={goBack}
      instance={instance}
      setPasswordData={setPasswordData}
    />
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
