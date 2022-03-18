import React, {useEffect, useState} from 'react'
import {Button, View, Text, TextInput} from 'react-native'
import Minilog from '@cozy/minilog'

import {queryResultToCrypto} from '../../../components/webviews/CryptoWebView/cryptoObservable/cryptoObservable'

const log = Minilog('PasswordView')

const ITERATION_NUMBER = 100_000

const getSaltForInstance = instance => {
  const domain = instance.split(':')[0]
  const salt = `me@${domain}`

  return salt
}

/**
 * Hash password data by calling CryptioWebView cryptography methods
 * @param {PasswordData} passwordData - the password data to hash
 * @param {string} instance - the Cozy instance used to generate the salt
 * @returns {LoginData} login data containing hashed password and encryption keys
 */
const doHashPassword = async (passwordData, fqdn) => {
  log.debug('Start hashing password')
  try {
    const {password, hint} = passwordData

    const salt = getSaltForInstance(fqdn)

    const result = await queryResultToCrypto('computePass', {
      pass: password,
      salt: salt,
      iterations: ITERATION_NUMBER,
    })

    const {iterations, key, publicKey, privateKey, passwordHash} = result.param

    const loginData = {
      passwordHash,
      hint,
      iterations,
      key,
      publicKey,
      privateKey,
    }

    return loginData
  } catch (e) {
    log.error('Error while requesting cryptography result:', e)
    throw e
  }
}

/**
 * Show a password form that asks the user their password and hint
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
  const [hint, onChangeHint] = useState('')

  const onLogin = async () => {
    setPasswordData({
      password,
      hint,
    })
  }

  return (
    <>
      <Text>FQDN</Text>
      <Text>{fqdn}</Text>

      <Text>Password</Text>
      <TextInput onChangeText={onChangePassword} value={password} />

      <Text>Hint</Text>
      <TextInput onChangeText={onChangeHint} value={hint} />

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
  setKeys,
  setError,
  cancelStep,
  cancelAll = undefined,
  errorMessage,
}) => {
  const [passwordData, setPasswordData] = useState()

  useEffect(() => {
    if (passwordData) {
      doHashPassword(passwordData, fqdn)
        .then(result => {
          setKeys(result)
        })
        .catch(error => {
          setError('Impossible to hash the password', error)
        })
    }
  }, [passwordData, fqdn, setKeys, setError])

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
