import React, {useCallback, useEffect, useState} from 'react'

import {ErrorView} from './components/ErrorView'
import {LoadingView} from './components/LoadingView'
import {OnboardingPasswordView} from './components/OnboardingPasswordView'

import {OnboardingConfigView} from './components/debug/OnboardingConfigView'

import Minilog from '@cozy/minilog'

import {callOnboardingInitClient} from '../../libs/client'
import {consumeRouteParameter} from '../../libs/functions/routeHelpers'
import {saveVaultInformation} from '../../libs/keychain'

import {routes} from '../../constants/routes'

const log = Minilog('OnboardingScreen')

Minilog.enable()

const LOADING_STEP = 'LOADING_STEP'
const ONBOARDING_STEP = 'ONBOARDING_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const ERROR_STEP = 'ERROR_STEP'

export const OnboardingScreen = ({setClient, route, navigation}) => {
  const [state, setState] = useState({
    step: ONBOARDING_STEP,
  })

  useEffect(() => {
    log.debug(`Enter state ${state.step}`)
  }, [state])

  useEffect(() => {
    if (state.loginData) {
      startOAuth()
    }
  }, [state.loginData, startOAuth])

  useEffect(() => {
    const registerToken = consumeRouteParameter(
      'registerToken',
      route,
      navigation,
    )
    const fqdn = consumeRouteParameter('fqdn', route, navigation)

    if (registerToken && fqdn) {
      // fqdn string should never contain the protocol, but we may want to enforce it
      // when local debuging as this configuration uses `http` only
      const url =
        fqdn.startsWith('http://') || fqdn.startsWith('https://')
          ? new URL(fqdn)
          : new URL(`https://${fqdn}`)

      setOnboardingData({
        fqdn: url.host,
        instance: url.origin,
        registerToken: registerToken,
      })
    }
  }, [navigation, route, setOnboardingData])

  const setOnboardingData = useCallback(
    onboardingData => {
      setState({
        ...state,
        step: PASSWORD_STEP,
        onboardingData: onboardingData,
      })
    },
    [state, setState],
  )

  const saveLoginData = useCallback(async loginData => {
    await saveVaultInformation('passwordHash', loginData.passwordHash)
    await saveVaultInformation('key', loginData.key)
    await saveVaultInformation('privateKey', loginData.privateKey)
    await saveVaultInformation('publicKey', loginData.publicKey)
    await saveVaultInformation('masterKey', loginData.masterKey)
  }, [])

  const setLoginData = loginData => {
    setState({
      ...state,
      step: LOADING_STEP,
      loginData: loginData,
    })
  }

  const cancelLogin = () => {
    setState({
      step: ONBOARDING_STEP,
    })
  }

  const cancelOnboarding = () => {
    navigation.navigate(routes.authenticate)
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

  const startOAuth = useCallback(async () => {
    try {
      const {loginData, onboardingData} = state

      const {instance, fqdn, registerToken} = onboardingData

      const client = await callOnboardingInitClient({
        loginData,
        instance,
        fqdn,
        registerToken,
      })

      await saveLoginData(loginData)
      setClient(client)
    } catch (error) {
      setError(error.message, error)
    }
  }, [saveLoginData, setClient, setError, state])

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
      <OnboardingPasswordView
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
          title: 'Cancel OAuth',
        }}
      />
    )
  }
}
