import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { OnboardingPasswordView } from './components/OnboardingPasswordView'

import Minilog from 'cozy-minilog'

import { navigateToError } from '/app/domain/errors/navigateToError'
import {
  callMagicLinkOnboardingInitClient,
  callOnboardingInitClient
} from '/libs/client'
import { resetKeychainAndSaveLoginData } from '/libs/functions/passwordHelpers'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { routes } from '/constants/routes'
import { useSplashScreen } from '/hooks/useSplashScreen'
import { getColors } from '/ui/colors'
import { CozyLogoScreen } from '/screens/login/components/CozyLogoScreen'
import { setStatusBarColorToMatchBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { getInstanceDataFromFqdn } from '/screens/login/components/functions/getInstanceDataFromRequest'

const log = Minilog('OnboardingScreen')

Minilog.enable()

const LOADING_STEP = 'LOADING_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const MAGIC_LINK_STEP = 'MAGIC_LINK_STEP'

const OAUTH_USER_CANCELED_ERROR = 'USER_CANCELED'

const colors = getColors()

const OnboardingSteps = ({
  clouderyTheme,
  navigation,
  route,
  setClouderyTheme,
  setClient
}) => {
  const { showSplashScreen } = useSplashScreen()
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

      setState(oldState => ({
        ...oldState,
        step: LOADING_STEP
      }))

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
    const clouderyThemeParam = consumeRouteParameter(
      'clouderyTheme',
      route,
      navigation
    )

    if (clouderyThemeParam) {
      setClouderyTheme(clouderyThemeParam)
    }
  }, [navigation, route, setClouderyTheme])

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

  const cancelOnboarding = useCallback(() => {
    navigation.navigate(routes.authenticate)
  }, [navigation])

  const setError = useCallback(
    (errorMessage, error) => {
      navigateToError(errorMessage, error, clouderyTheme.backgroundColor)
    },
    [clouderyTheme]
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

      showSplashScreen()
      await resetKeychainAndSaveLoginData(loginData)
      setClient(client)
    } catch (error) {
      if (error === OAUTH_USER_CANCELED_ERROR) {
        cancelOnboarding()
      } else {
        setError(error.message, error)
      }
    }
  }, [setClient, setError, state, cancelOnboarding, showSplashScreen])

  const startMagicLinkOAuth = useCallback(async () => {
    try {
      const { instance, magicCode } = state.onboardingData

      const client = await callMagicLinkOnboardingInitClient({
        instance,
        magicCode
      })

      showSplashScreen()
      setClient(client)
    } catch (error) {
      if (error === OAUTH_USER_CANCELED_ERROR) {
        cancelOnboarding()
      } else {
        setError(error.message, error)
      }
    }
  }, [setClient, setError, state, cancelOnboarding, showSplashScreen])

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
        setReadonly={setStepReadonly}
      />
    )
  }

  if (state.step === LOADING_STEP || state.step === MAGIC_LINK_STEP) {
    return <CozyLogoScreen backgroundColor={clouderyTheme.backgroundColor} />
  }
}

export const OnboardingScreen = ({ setClient, route, navigation }) => {
  const [clouderyTheme, setClouderyTheme] = useState({
    backgroundColor: colors.onboardingBackgroundColor
  })

  const setClouderyThemeAndStatusBarColor = theme => {
    setStatusBarColorToMatchBackground(theme?.backgroundColor)
    setClouderyTheme(theme)
  }

  return (
    <View
      style={[
        styles.view,
        {
          backgroundColor: clouderyTheme.backgroundColor
        }
      ]}
    >
      <OnboardingSteps
        clouderyTheme={clouderyTheme}
        setClient={setClient}
        route={route}
        navigation={navigation}
        setClouderyTheme={setClouderyThemeAndStatusBarColor}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
