import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ErrorView } from './components/ErrorView'
import { OnboardingPasswordView } from './components/OnboardingPasswordView'

import Minilog from '@cozy/minilog'

import {
  callMagicLinkOnboardingInitClient,
  callOnboardingInitClient
} from '/libs/client'
import { useDimensions } from '/libs/dimensions'
import { resetKeychainAndSaveLoginData } from '/libs/functions/passwordHelpers'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { routes } from '/constants/routes'
import { getColors } from '/ui/colors'
import { CozyLogoScreen } from '/screens/login/components/CozyLogoScreen'
import { setStatusBarColorToMatchBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { getInstanceDataFromFqdn } from '/screens/login/components/functions/getInstanceDataFromRequest'

const log = Minilog('OnboardingScreen')

Minilog.enable()

const LOADING_STEP = 'LOADING_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const MAGIC_LINK_STEP = 'MAGIC_LINK_STEP'
const ERROR_STEP = 'ERROR_STEP'

const OAUTH_USER_CANCELED_ERROR = 'USER_CANCELED'

const colors = getColors()

const OnboardingSteps = ({
  backgroundColor,
  navigation,
  route,
  setBackgroundColor,
  setClient
}) => {
  const [state, setState] = useState({
    step: LOADING_STEP
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
    if (state?.onboardingData?.magicCode) {
      startMagicLinkOAuth()
    }
  }, [state?.onboardingData?.magicCode, startMagicLinkOAuth])

  useEffect(() => {
    const registerToken = consumeRouteParameter(
      'registerToken',
      route,
      navigation
    )
    const fqdn = consumeRouteParameter('fqdn', route, navigation)
    const magicCode = consumeRouteParameter('magicCode', route, navigation)

    if (fqdn) {
      const instanceData = getInstanceDataFromFqdn(fqdn)

      if (registerToken) {
        setOnboardingData({
          fqdn: instanceData.fqdn,
          instance: instanceData.instance,
          registerToken: registerToken
        })
      } else if (magicCode) {
        setMagicLinkOnboardingData({
          fqdn: instanceData.fqdn,
          instance: instanceData.instance,
          magicCode: magicCode
        })
      }
    }
  }, [navigation, route, setOnboardingData, setMagicLinkOnboardingData])

  useEffect(() => {
    const backgroundColorParam = consumeRouteParameter(
      'backgroundColor',
      route,
      navigation
    )

    if (backgroundColorParam) {
      setBackgroundColor(backgroundColorParam)
    }
  }, [navigation, setBackgroundColor, route])

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

  const setMagicLinkOnboardingData = useCallback(
    onboardingData => {
      setState({
        ...state,
        step: MAGIC_LINK_STEP,
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

  const startMagicLinkOAuth = useCallback(async () => {
    try {
      const { instance, magicCode } = state.onboardingData

      const client = await callMagicLinkOnboardingInitClient({
        instance,
        magicCode
      })

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
    const { fqdn, instance } = state.onboardingData
    return (
      <OnboardingPasswordView
        fqdn={fqdn}
        instance={instance}
        goBack={cancelOnboarding}
        setKeys={setLoginData}
        setError={setError}
        readonly={state.stepReadonly}
        setBackgroundColor={setBackgroundColor}
        setReadonly={setStepReadonly}
      />
    )
  }

  if (state.step === LOADING_STEP || state.step === MAGIC_LINK_STEP) {
    return <CozyLogoScreen backgroundColor={backgroundColor} />
  }

  if (state.step === ERROR_STEP) {
    return (
      <ErrorView
        errorMessage={state.errorMessage}
        error={state.error}
        button={{
          callback: cancelLogin,
          title: 'Cancel OAuth'
        }}
        backgroundColor={backgroundColor}
      />
    )
  }
}

export const OnboardingScreen = ({ setClient, route, navigation }) => {
  const [backgroundColor, setBackgroundColor] = useState(colors.primaryColor)
  const dimensions = useDimensions()

  const setBackgroundAndStatusBarColor = backgroundColor => {
    setStatusBarColorToMatchBackground(backgroundColor)
    setBackgroundColor(backgroundColor)
  }

  return (
    <View
      style={[
        styles.view,
        {
          backgroundColor: backgroundColor
        }
      ]}
    >
      <View style={{ height: dimensions.statusBarHeight }} />
      <OnboardingSteps
        backgroundColor={backgroundColor}
        setClient={setClient}
        route={route}
        navigation={navigation}
        setBackgroundColor={setBackgroundAndStatusBarColor}
      />
      <View style={{ height: dimensions.navbarHeight }} />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
