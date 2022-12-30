import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ErrorView } from './components/ErrorView'
import { OnboardingPasswordView } from './components/OnboardingPasswordView'

import Minilog from '@cozy/minilog'

import { callOnboardingInitClient } from '/libs/client'
import { useDimensions } from '/libs/dimensions'
import { resetKeychainAndSaveLoginData } from '/libs/functions/passwordHelpers'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'

import { routes } from '/constants/routes'

import { getColors } from '/theme/colors'
import { useSplashScreen } from '/hooks/useSplashScreen'

const log = Minilog('OnboardingScreen')

Minilog.enable()

const LOADING_STEP = 'LOADING_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const ERROR_STEP = 'ERROR_STEP'

const OAUTH_USER_CANCELED_ERROR = 'USER_CANCELED'

const OnboardingSteps = ({ setClient, route, navigation }) => {
  const [state, setState] = useState({
    step: LOADING_STEP
  })
  const { showSplashScreen, hideSplashScreen } = useSplashScreen()

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
      navigation
    )
    const fqdn = consumeRouteParameter('fqdn', route, navigation)

    if (registerToken && fqdn) {
      // fqdn string should never contain the protocol, but we may want to enforce it
      // when local debugging as this configuration uses `http` only
      const url =
        fqdn.startsWith('http://') || fqdn.startsWith('https://')
          ? new URL(fqdn)
          : new URL(`https://${fqdn}`)

      setOnboardingData({
        fqdn: url.host,
        instance: url.origin,
        registerToken: registerToken
      })
    }
  }, [navigation, route, setOnboardingData])

  const setStepReadonly = isReadOnly => {
    setState(oldState => ({
      ...oldState,
      stepReadonly: isReadOnly
    }))
  }

  const setOnboardingData = useCallback(
    onboardingData => {
      setState({
        ...state,
        step: PASSWORD_STEP,
        stepReadonly: false,
        onboardingData: onboardingData
      })
    },
    [state, setState]
  )

  const setLoginData = loginData => {
    setState({
      ...state,
      step: LOADING_STEP,
      loginData: loginData
    })
  }

  const cancelLogin = () => {
    setState({
      step: LOADING_STEP
    })
  }

  const cancelOnboarding = useCallback(() => {
    navigation.navigate(routes.authenticate)
  }, [navigation])

  const setError = useCallback(
    (errorMessage, error) => {
      setState({
        ...state,
        step: ERROR_STEP,
        errorMessage: errorMessage,
        error: error,
        previousStep: state.step
      })
    },
    [state]
  )

  const startOAuth = useCallback(async () => {
    try {
      const { loginData, onboardingData } = state

      const { instance, fqdn, registerToken } = onboardingData

      const client = await callOnboardingInitClient({
        loginData,
        instance,
        fqdn,
        registerToken
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
  }, [setClient, setError, state, cancelOnboarding])

  if (state.step === PASSWORD_STEP) {
    hideSplashScreen()
    const { fqdn, instance } = state.onboardingData
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
    showSplashScreen()
    return null
  }

  if (state.step === ERROR_STEP) {
    hideSplashScreen()
    return (
      <ErrorView
        errorMessage={state.errorMessage}
        error={state.error}
        button={{
          callback: cancelLogin,
          title: 'Cancel OAuth'
        }}
      />
    )
  }
}

export const OnboardingScreen = ({ setClient, route, navigation }) => {
  const dimensions = useDimensions()

  return (
    <View style={styles.view}>
      <View style={{ height: dimensions.statusBarHeight }} />
      <OnboardingSteps
        setClient={setClient}
        route={route}
        navigation={navigation}
      />
      <View style={{ height: dimensions.navbarHeight }} />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: getColors().primaryColor
  }
})
