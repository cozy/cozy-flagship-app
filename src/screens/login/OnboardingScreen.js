import React, {useCallback, useEffect, useState} from 'react'
import {StyleSheet, View} from 'react-native'

import {ErrorView} from './components/ErrorView'
import {LoadingView} from './components/LoadingView'
import {OnboardingPasswordView} from './components/OnboardingPasswordView'

import {OnboardingConfigView} from './components/debug/OnboardingConfigView'

import Minilog from '@cozy/minilog'

import {callOnboardingInitClient} from '../../libs/client'
import {navbarHeight, statusBarHeight} from '../../libs/dimensions'
import {resetKeychainAndSaveLoginData} from '../../libs/functions/passwordHelpers'
import {consumeRouteParameter} from '../../libs/functions/routeHelpers'

import {routes} from '../../constants/routes'

import {getColors} from '../../theme/colors'

const log = Minilog('OnboardingScreen')

Minilog.enable()

const LOADING_STEP = 'LOADING_STEP'
const ONBOARDING_STEP = 'ONBOARDING_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const ERROR_STEP = 'ERROR_STEP'

const OAUTH_USER_CANCELED_ERROR = 'USER_CANCELED'

const OnboardingSteps = ({setClient, route, navigation}) => {
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

  const setStepReadonly = isReadOnly => {
    setState(oldState => ({
      ...oldState,
      stepReadonly: isReadOnly,
    }))
  }

  const setOnboardingData = useCallback(
    onboardingData => {
      setState({
        ...state,
        step: PASSWORD_STEP,
        stepReadonly: false,
        onboardingData: onboardingData,
      })
    },
    [state, setState],
  )

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

      await resetKeychainAndSaveLoginData(loginData)
      setClient(client)
    } catch (error) {
      if (error === OAUTH_USER_CANCELED_ERROR) {
        cancelOnboarding()
      } else {
        setError(error.message, error)
      }
    }
  }, [setClient, setError, state])

  if (state.step === ONBOARDING_STEP) {
    return (
      <OnboardingConfigView
        setOnboardingData={setOnboardingData}
        cancelOnboarding={cancelOnboarding}
      />
    )
  }

  if (state.step === PASSWORD_STEP) {
    const {fqdn, instance} = state.onboardingData
    return (
      <OnboardingPasswordView
        fqdn={fqdn}
        instance={instance}
        goBack={cancelOnboarding}
        setKeys={setLoginData}
        setError={setError}
        readonly={state.stepReadonly}
        setReadonly={setStepReadonly}
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

export const OnboardingScreen = ({setClient, route, navigation}) => {
  return (
    <View style={styles.view}>
      <View style={{height: statusBarHeight}} />
      <OnboardingSteps
        setClient={setClient}
        route={route}
        navigation={navigation}
      />
      <View style={{height: navbarHeight}} />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: getColors().primaryColor,
  },
})
