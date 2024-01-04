import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native'

import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { doHashPassword } from '/libs/functions/passwordHelpers'
import { setFocusOnWebviewField } from '/libs/functions/keyboardHelper'

import { getHtml } from './assets/OnboardingPasswordView/htmlOnboardingPasswordInjection'

import { getColors } from '/ui/colors'

/**
 * Show a password form that asks the user their password and hint
 * When the user validate their password, the password and the salt are sent back to parent
 * by calling `setPasswordData`
 *
 * @param {object} props
 * @param {string} [props.errorMessage] - Error message to display if defined
 * @param {string} props.fqdn - The Cozy's fqdn
 * @param {Function} props.goBack - Function to call when the back button is clicked
 * @param {string} props.instance - The Cozy's url
 * @param {boolean} props.readonly - Specify if the form should be readonly
 * @param {setPasswordData} props.setPasswordData - Function to call to set the user's password
 * @param {setReadonly} props.setReadonly - Trigger change on the readonly state
 * @returns {import('react').ComponentClass}
 */
const PasswordForm = ({
  errorMessage,
  instance,
  goBack,
  readonly,
  setPasswordData,
  setReadonly
}) => {
  const [loading, setLoading] = useState(true)
  const webviewRef = useRef()
  const colors = getColors()

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
      setFocusOnWebviewField(webviewRef.current, 'password')
    }
  }, [loading, webviewRef])

  const html = getHtml(instance, errorMessage)

  const setPassword = (passphrase, hint) => {
    setReadonly(true)
    setPasswordData({
      password: passphrase,
      hint: hint
    })
  }

  const processMessage = event => {
    if (event.nativeEvent && event.nativeEvent.data) {
      const message = JSON.parse(event.nativeEvent.data)

      if (message.message === 'loaded') {
        setLoading(false)
      } else if (message.message === 'setPassphrase') {
        setPassword(message.passphrase, message.hint)
      } else if (message.message === 'backButton') {
        goBack()
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
              backgroundColor: colors.onboardingBackgroundColor
            }
          ]}
        />
      )}
    </Wrapper>
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
 * @param {boolean} props.readonly - Specify if the form should be readonly
 * @param {setErrorCallback} props.setError - Function to call when an error is thrown by the component
 * @param {setLoginDataCallback} props.setKeys - Function to call to set the user's password and encryption keys
 * @param {setReadonly} props.setReadonly - Trigger change on the readonly state
 * @returns {import('react').JSXElementConstructor}
 */
export const OnboardingPasswordView = ({
  errorMessage,
  fqdn,
  goBack,
  instance,
  kdfIterations,
  readonly,
  setError,
  setKeys,
  setReadonly
}) => {
  const [passwordData, setPasswordData] = useState()

  useEffect(() => {
    if (passwordData) {
      doHashPassword(passwordData, fqdn, kdfIterations)
        .then(result => {
          setPasswordData(undefined)
          return setKeys(result)
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
      readonly={readonly}
      setReadonly={setReadonly}
    />
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
