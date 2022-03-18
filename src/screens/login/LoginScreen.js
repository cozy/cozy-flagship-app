import React, {useEffect, useState} from 'react'

import Minilog from '@cozy/minilog'

import {ClouderyView} from './components/ClouderyView'
import {ErrorView} from './components/ErrorView'
import {PasswordView} from './components/PasswordView'
import {
  TwoFactorAuthenticationView,
  TwoFactorAuthenticationWrongCodeView,
} from './components/TwoFactorAuthenticationView'
import {OAuthSummaryView} from './components/debug/OAuthSummaryView'

import {
  callInitClient,
  call2FAInitClient,
  STATE_2FA_NEEDED,
  STATE_INVALID_PASSWORD,
} from '../../libs/client'

const log = Minilog('LoginScreen')

const CLOUDERY_STEP = 'CLOUDERY_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const OAUTH_SUMMARY_STEP = 'OAUTH_SUMMARY_STEP'
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

  const setInstanceData = ({instance, fqdn}) => {
    setState({
      step: PASSWORD_STEP,
      fqdn: fqdn,
      instance: instance,
    })
  }

  const cancelLogin = () => {
    setState({
      step: CLOUDERY_STEP,
    })
  }

  const saveLoginData = loginData => {
    // TODO: Save login data in local storage
  }

  const setLoginData = loginData => {
    saveLoginData()

    setState({
      ...state,
      step: OAUTH_SUMMARY_STEP,
      loginData: loginData,
    })
  }

  const startOAuth = async () => {
    try {
      const {loginData, instance} = state

      const result = await callInitClient({
        loginData,
        instance,
      })

     if (result.state === STATE_2FA_NEEDED) {
        setState({
          ...state,
          step: TWO_FACTOR_AUTHENTICATION_STEP,
          client: result.client,
          twoFactorToken: result.twoFactorToken,
        })
      } else {
        setClient(result.client)
      }
    } catch (error) {
      setError(error.message, error)
    }
  }

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

  const setError = (errorMessage, error) => {
    setState({
      ...state,
      step: ERROR_STEP,
      errorMessage: errorMessage,
      error: error,
      previousStep: state.step,
    })
  }

  if (state.step === CLOUDERY_STEP) {
    return <ClouderyView setInstanceData={setInstanceData} />
  }

  if (state.step === PASSWORD_STEP) {
    return (
      <PasswordView
        fqdn={state.fqdn}
        setKeys={setLoginData}
        setError={setError}
        cancelStep={{
          callback: cancelLogin,
          title: 'Cancel OAuth',
        }}
      />
    )
  }

  if (state.step === OAUTH_SUMMARY_STEP) {
    return (
      <OAuthSummaryView
        loginData={state.loginData}
        startOauth={startOauth}
        cancelLogin={cancelLogin}
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
