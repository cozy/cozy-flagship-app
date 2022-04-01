import React, {useEffect, useState} from 'react'
import {Linking, View, StyleSheet} from 'react-native'
import {WebView} from 'react-native-webview'

import {doHashPassword} from '../../../libs/functions/passwordHelpers'

import {getHtml} from './assets/PasswordView/htmlPasswordInjection'

const openForgotPasswordLink = instance => {
  const url = new URL(instance)

  url.pathname = '/auth/passphrase_reset'

  Linking.openURL(url.toString())
}

/**
 * Show a password form that asks the user their password
 * When the user validate their password, the password is sent back to parent
 * by calling `setPasswordData`
 *
 * @param {object} props
 * @param {string} [props.errorMessage] - Error message to display if defined
 * @param {string} props.fqdn - The Cozy's fqdn
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {string} props.name - The user's name as configured in the Cozy's settings
 * @param {Function} props.requestTransitionStart - Function to call when the component is ready to be displayed and the app should transition to it
 * @param {setPasswordData} props.setPasswordData - Function to call to set the user's password
 * @returns {import('react').ComponentClass}
 */
const PasswordForm = ({
  errorMessage,
  fqdn,
  goBack,
  instance,
  name,
  requestTransitionStart,
  setPasswordData,
}) => {
  const [loading, setLoading] = useState(true)

  const html = getHtml(name, fqdn, instance, errorMessage)

  const setLoaded = avatarPosition => {
    setLoading(false)
    requestTransitionStart(avatarPosition)
  }

  const setPassword = passphrase => {
    setPasswordData({
      password: passphrase,
    })
  }

  const processMessage = event => {
    if (event.nativeEvent && event.nativeEvent.data) {
      const message = JSON.parse(event.nativeEvent.data)

      if (message.message === 'loaded') {
        setLoaded(message.avatarPosition)
      } else if (message.message === 'setPassphrase') {
        setPassword(message.passphrase)
      } else if (message.message === 'forgotPassword') {
        openForgotPasswordLink(instance)
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
 * @param {string} [props.errorMessage] - Error message to display if defined
 * @param {string} props.fqdn - The Cozy's fqdn
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {number} [props.kdfIterations] - The number of KDF iterations to be used for hashing the password
 * @param {string} props.name - The user's name as configured in the Cozy's settings
 * @param {Function} props.requestTransitionStart - Function to call when the component is ready to be displayed and the app should transition to it
 * @param {setLoginDataCallback} props.setKeys - Function to call to set the user's password and encryption keys
 * @param {setErrorCallback} props.setError - Function to call when an error is thrown by the component
 * @returns {import('react').ComponentClass}
 */
export const PasswordView = ({
  errorMessage,
  fqdn,
  goBack,
  instance,
  kdfIterations,
  name,
  requestTransitionStart,
  setKeys,
  setError,
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
      name={name}
      requestTransitionStart={requestTransitionStart}
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
