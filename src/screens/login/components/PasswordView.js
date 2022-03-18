import React, {useEffect, useState} from 'react'
import {Button, View, Text, TextInput} from 'react-native'

import {doHashPassword} from '../../../libs/functions/passwordHelpers'

/**
 * Show a password form that asks the user their password
 * When the user validate their password, the password and the salt are sent back to parent
 * by calling `setPasswordData`
 *
 * @param {object} props
 * @param {setPasswordData} props.setPasswordData
 * @param {string} props.fqdn
 * @returns {import('react').ComponentClass}
 */
const PasswordForm = ({setPasswordData, fqdn}) => {
  const [password, onChangePassword] = useState('')

  const onLogin = async () => {
    setPasswordData({
      password,
    })
  }

  return (
    <>
      <Text>FQDN</Text>
      <Text>{fqdn}</Text>

      <Text>Password</Text>
      <TextInput onChangeText={onChangePassword} value={password} />

      <Button onPress={onLogin} title="Login" accessibilityLabel="Login" />
    </>
  )
}

/**
 * Show a password view that asks the user their password and hint
 * When the user validate their password, the password is hashed and is send back to parent
 * with corresponding cryptographic keys by calling `setKeys`
 * If an error occurs, then `setError` is called
 *
 * @param {object} props
 * @param {string} props.fqdn
 * @param {setLoginDataCallback} props.setKeys
 * @param {setErrorCallback} props.setError
 * @param {ButtonInfo} props.cancelStep
 * @param {ButtonInfo} [props.cancelAll]
 * @returns {import('react').ComponentClass}
 */
export const PasswordView = ({
  fqdn,
  kdfIterations,
  setKeys,
  setError,
  cancelStep,
  cancelAll = undefined,
  errorMessage,
}) => {
  const [passwordData, setPasswordData] = useState()

  useEffect(() => {
    if (passwordData) {
      doHashPassword(passwordData, fqdn, kdfIterations)
        .then(result => {
          setKeys(result)
        })
        .catch(error => {
          setError('Impossible to hash the password', error)
        })
    }
  }, [passwordData, fqdn, setKeys, setError, kdfIterations])

  return (
    <View>
      <PasswordForm setPasswordData={setPasswordData} fqdn={fqdn} />
      {errorMessage && <Text>{errorMessage}</Text>}
      <View style={{marginTop: 20}}>
        <Button
          onPress={() => cancelStep.callback()}
          title={cancelStep.title}
        />
      </View>
      {cancelAll && (
        <View style={{marginTop: 20}}>
          <Button
            onPress={() => cancelAll.callback()}
            title={cancelAll.title}
          />
        </View>
      )}
    </View>
  )
}
