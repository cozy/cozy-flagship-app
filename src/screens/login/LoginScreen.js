import React, {useCallback, useEffect, useState} from 'react'

import Minilog from '@cozy/minilog'

import {ClouderyView} from './components/ClouderyView'
import {ErrorView} from './components/ErrorView'
import {LoadingView} from './components/LoadingView'
import {PasswordView} from './components/PasswordView'
import {
  TwoFactorAuthenticationView,
  TwoFactorAuthenticationWrongCodeView,
} from './components/TwoFactorAuthenticationView'

import {
  callInitClient,
  call2FAInitClient,
  createClient,
  fetchKdfIterations,
  STATE_2FA_NEEDED,
  STATE_INVALID_PASSWORD,
} from '../../libs/client'
import {saveVaultInformation} from '../../libs/keychain'

const log = Minilog('LoginScreen')

const LOADING_STEP = 'LOADING_STEP'
const CLOUDERY_STEP = 'CLOUDERY_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const TWO_FACTOR_AUTHENTICATION_STEP = 'TWO_FACTOR_AUTHENTICATION_STEP'
const TWO_FACTOR_AUTHENTICATION_ERROR_STEP =
  'TWO_FACTOR_AUTHENTICATION_ERROR_STEP'
const ERROR_STEP = 'ERROR_STEP'

export const LoginScreen = ({setClient}) => {
  const [state, setState] = useState({
    step: CLOUDERY_STEP,
  })

  useEffect(() => {
    log.debug(`Enter state ${state.step}`)
  }, [state])

  useEffect(() => {
    if (state.loginData) {
      startOAuth()
    }
  }, [state.loginData, startOAuth])

  const setInstanceData = async ({instance, fqdn}) => {
    try {
      const client = await createClient(instance)

      const kdfIterations = await fetchKdfIterations({
        instance,
        client,
      })

      setState({
        step: PASSWORD_STEP,
        fqdn: fqdn,
        instance: instance,
        kdfIterations: kdfIterations,
        client: client,
      })
    } catch (error) {
      setError(error.message, error)
    }
  }

  const cancelLogin = () => {
    setState({
      step: CLOUDERY_STEP,
    })
  }

  const saveLoginData = async loginData => {
    await saveVaultInformation('passwordHash', loginData.passwordHash)
    await saveVaultInformation('key', loginData.key)
    await saveVaultInformation('privateKey', loginData.privateKey)
    await saveVaultInformation('publicKey', loginData.publicKey)
    await saveVaultInformation('masterKey', loginData.masterKey)
  }

  const setLoginData = loginData => {
    setState({
      ...state,
      step: LOADING_STEP,
      loginData: loginData,
    })
  }

  const startOAuth = useCallback(async () => {
    try {
      const {loginData, instance, client} = state

      const result = await callInitClient({
        loginData,
        instance,
        client,
      })

      if (result.state === STATE_INVALID_PASSWORD) {
        setState({
          ...state,
          step: PASSWORD_STEP,
          errorMessage: 'Invalid password',
        })
      } else if (result.state === STATE_2FA_NEEDED) {
        setState({
          ...state,
          step: TWO_FACTOR_AUTHENTICATION_STEP,
          client: result.client,
          twoFactorToken: result.twoFactorToken,
        })
      } else {
        await saveLoginData(loginData)
        setClient(result.client)
      }
    } catch (error) {
      setError(error.message, error)
    }
  }, [setClient, setError, state])

  const continueOAuth = async twoFactorCode => {
    try {
      const {loginData, client, twoFactorToken} = state

      const result = await call2FAInitClient({
        loginData,
        client,
        twoFactorAuthenticationData: {
          token: twoFactorToken,
          passcode: twoFactorCode,
        },
      })

      if (result.state === STATE_2FA_NEEDED) {
        setState({
          ...state,
          step: TWO_FACTOR_AUTHENTICATION_ERROR_STEP,
          client: result.client,
          twoFactorToken: result.twoFactorToken,
        })
      } else {
        await saveLoginData(loginData)
        setClient(result.client)
      }
    } catch (error) {
      setError(error.message, error)
    }
  }

  const retryTwoFactorAuthentication = () => {
    setState({
      ...state,
      step: TWO_FACTOR_AUTHENTICATION_STEP,
    })
  }

  const setError = useCallback(
    (errorMessage, error) => {
      setState({
        ...state,
        step: ERROR_STEP,
        errorMessage: errorMessage,
        error: error,
        previousStep: state.step,
      })
    },
    [state],
  )

  if (state.step === CLOUDERY_STEP) {
    return <ClouderyView setInstanceData={setInstanceData} />
  }

  if (state.step === PASSWORD_STEP) {
    return (
      <PasswordView
        fqdn={state.fqdn}
        kdfIterations={state.kdfIterations}
        setKeys={setLoginData}
        setError={setError}
        errorMessage={state.errorMessage}
        cancelStep={{
          callback: cancelLogin,
          title: 'Cancel OAuth',
        }}
      />
    )
  }

  if (state.step === TWO_FACTOR_AUTHENTICATION_STEP) {
    return (
      <TwoFactorAuthenticationView
        setTwoFactorCode={continueOAuth}
        cancelLogin={cancelLogin}
      />
    )
  }

  if (state.step === TWO_FACTOR_AUTHENTICATION_ERROR_STEP) {
    return (
      <TwoFactorAuthenticationWrongCodeView
        retry={retryTwoFactorAuthentication}
        cancel={cancelLogin}
      />
    )
  }

  if (state.step === LOADING_STEP) {
    return <LoadingView message={state.loadingMessage} />
  }

  if (state.step === ERROR_STEP) {
    return (
      <ErrorView
        errorMessage={state.errorMessage}
        error={state.error}
        button={{
          callback: cancelLogin,
          title: 'Restart login',
        }}
      />
    )
  }
}
