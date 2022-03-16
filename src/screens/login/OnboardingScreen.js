import React, {useCallback, useEffect, useState} from 'react'

import {ErrorView} from './components/ErrorView'
import {PasswordView} from './components/PasswordView'

import {OnboardingConfigView} from './components/debug/OnboardingConfigView'
import {OAuthSummaryView} from './components/debug/OAuthSummaryView'

import Minilog from '@cozy/minilog'

import {callOnboardingInitClient} from '../../libs/client'

const log = Minilog('OnboardingScreen')

Minilog.enable()

const ONBOARDING_STEP = 'ONBOARDING_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const OAUTH_SUMMARY_STEP = 'OAUTH_SUMMARY_STEP'
const ERROR_STEP = 'ERROR_STEP'

export const OnboardingScreen = ({setClient}) => {
  const [state, setState] = useState({
    step: ONBOARDING_STEP,
  })

  useEffect(() => {
    log.debug(`Enter state ${state.step}`)
  }, [state])

  const setOnboardingData = onboardingData => {
    setState({
      ...state,
      step: PASSWORD_STEP,
      onboardingData: onboardingData,
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

  const cancelLogin = () => {
    setState({
      step: ONBOARDING_STEP,
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

  const startOAuth = async () => {
    const {loginData, onboardingData} = state

    const {instance, fqdn, registerToken} = onboardingData

    const client = await callOnboardingInitClient({
      loginData,
      instance,
      fqdn,
      registerToken,
    })

    setClient(client)
  }

  if (state.step === ONBOARDING_STEP) {
    return (
      <OnboardingConfigView
        setOnboardingData={setOnboardingData}
        cancelOnboarding={cancelOnboarding}
      />
    )
  }

  if (state.step === PASSWORD_STEP) {
    const {fqdn} = state.onboardingData
    return (
      <PasswordView
        fqdn={fqdn}
        setKeys={setLoginData}
        setError={setError}
        cancelStep={{
          callback: cancelLogin,
          title: 'Cancel OAuth',
        }}
        cancelAll={{
          callback: cancelOnboarding,
          title: 'Cancel Onboarding',
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
        cancelOnboarding={cancelOnboarding}
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
          title: 'Cancel OAuth',
        }}
      />
    )
  }
}
