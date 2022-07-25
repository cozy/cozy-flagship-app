import React, { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  View,
  StyleSheet
} from 'react-native'

import { SupervisedWebView } from '/components/webviews/SupervisedWebView'
import { doHashPassword } from '../../../libs/functions/passwordHelpers'
import { setFocusOnWebviewField } from '../../../libs/functions/keyboardHelper'

import { getHtml } from './assets/PasswordView/htmlPasswordInjection'

import { getColors } from '../../../theme/colors'

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
 * @param {boolean} props.readonly - Specify if the form should be readonly
 * @param {setPasswordData} props.setPasswordData - Function to call to set the user's password
 * @param {setReadonly} props.setReadonly - Trigger change on the readonly state
 * @returns {import('react').ComponentClass}
 */
const PasswordForm = ({
  errorMessage,
  fqdn,
  goBack,
  instance,
  name,
  requestTransitionStart,
  readonly,
  setPasswordData,
  setReadonly,
  waitForTransition
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
    if (webviewRef && !loading && !waitForTransition) {
      setFocusOnWebviewField(webviewRef.current, 'password')
    }
  }, [loading, waitForTransition, webviewRef])

  useEffect(() => {
    if (webviewRef && errorMessage) {
      const payload = JSON.stringify({
        message: 'setErrorMessage',
        param: errorMessage
      })

      const webView = webviewRef.current
      webView.postMessage(payload)
    }
  }, [webviewRef, errorMessage])

  const html = getHtml(name, fqdn, instance)

  const setLoaded = avatarPosition => {
    setLoading(false)
    requestTransitionStart(avatarPosition)
  }

  const setPassword = passphrase => {
    setReadonly(true)
    setPasswordData({
      password: passphrase
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

  const Wrapper = Platform.OS === 'ios' ? View : KeyboardAvoidingView

  return (
    <Wrapper style={styles.view} behavior="height">
      <SupervisedWebView
        ref={webviewRef}
        javaScriptEnabled={true}
        onMessage={processMessage}
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: colors.primaryColor }}
      />
      {loading && (
        <View
          style={[
            styles.loadingOverlay,
            {
              backgroundColor: colors.primaryColor
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
 * @param {string} props.name - The user's name as configured in the Cozy's settings
 * @param {boolean} props.readonly - Specify if the form should be readonly
 * @param {Function} props.requestTransitionStart - Function to call when the component is ready to be displayed and the app should transition to it
 * @param {setLoginDataCallback} props.setKeys - Function to call to set the user's password and encryption keys
 * @param {setErrorCallback} props.setError - Function to call when an error is thrown by the component
 * @param {setReadonly} props.setReadonly - Trigger change on the readonly state
 * @returns {import('react').ComponentClass}
 */
export const PasswordView = ({
  errorMessage,
  fqdn,
  goBack,
  instance,
  kdfIterations,
  name,
  readonly,
  requestTransitionStart,
  setKeys,
  setError,
  setReadonly,
  waitForTransition
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
      name={name}
      requestTransitionStart={requestTransitionStart}
      setPasswordData={setPasswordData}
      readonly={readonly}
      setReadonly={setReadonly}
      waitForTransition={waitForTransition}
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
