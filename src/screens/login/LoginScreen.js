import React, { useCallback, useEffect, useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import Minilog from '@cozy/minilog'

import { ClouderyView } from './components/ClouderyView'
import { ErrorView } from './components/ErrorView'
import { OidcOnboardingView } from './components/OidcOnboardingView'
import { PasswordView } from './components/PasswordView'
import { TransitionToPasswordView } from './components/transitions/TransitionToPasswordView'
import { TransitionToAuthorizeView } from './components/transitions/TransitionToAuthorizeView'
import { TwoFactorAuthenticationView } from './components/TwoFactorAuthenticationView'

import {
  callInitClient,
  call2FAInitClient,
  authorizeClient,
  createClient,
  fetchPublicData,
  connectMagicLinkClient,
  connectOidcClient
} from '/libs/client'
import {
  STATE_2FA_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_INVALID_PASSWORD
} from '/libs/clientHelpers/types'
import { useDimensions } from '/libs/dimensions'
import { resetKeychainAndSaveLoginData } from '/libs/functions/passwordHelpers'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { useSplashScreen } from '/hooks/useSplashScreen'
import strings from '/constants/strings.json'
import { getColors } from '/ui/colors'
import { NetService } from '/libs/services/NetService'
import { routes } from '/constants/routes'
import { setStatusBarColorToMatchBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'

const log = Minilog('LoginScreen')

const LOADING_STEP = 'LOADING_STEP'
const CLOUDERY_STEP = 'CLOUDERY_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const OIDC_ONBOARD_STEP = 'OIDC_ONBOARD_STEP'
const TWO_FACTOR_AUTHENTICATION_STEP = 'TWO_FACTOR_AUTHENTICATION_STEP'
const AUTHORIZE_TRANSITION_STEP = 'AUTHORIZE_TRANSITION_STEP'
const ERROR_STEP = 'ERROR_STEP'

const OAUTH_USER_CANCELED_ERROR = 'USER_CANCELED'

const colors = getColors()

const LoginSteps = ({
  backgroundColor,
  clouderyMode,
  disableAutofocus,
  goBack,
  navigation,
  route,
  setBackgroundColor,
  setClient
}) => {
  const { showSplashScreen } = useSplashScreen()
  const [state, setState] = useState({
    step: CLOUDERY_STEP
  })

  useEffect(() => {
    log.debug(`Enter state ${state.step}`)
  }, [state])

  const handleBackPress = useCallback(() => {
    if (goBack) {
      setState({
        step: CLOUDERY_STEP
      })
      goBack()
      return true
    }
    return false
  }, [goBack])

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress)

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
  }, [handleBackPress])

  useEffect(() => {
    if (state.loginData && state.step === PASSWORD_STEP) {
      startOAuth()
    }
  }, [state.loginData, state.step, startOAuth])

  useEffect(() => {
    if (state.sessionCode && !state.waitForTransition) {
      authorize()
    }
  }, [state.sessionCode, state.waitForTransition, authorize])

  useEffect(() => {
    const fqdn = consumeRouteParameter('fqdn', route, navigation)
    const magicCode = consumeRouteParameter('magicCode', route, navigation)
    if (fqdn) {
      // fqdn string should never contain the protocol, but we may want to enforce it
      // when local debugging as this configuration uses `http` only
      const url =
        fqdn.startsWith('http://') || fqdn.startsWith('https://')
          ? new URL(fqdn)
          : new URL(`https://${fqdn}`)

      const normalizedFqdn = url.host.toLowerCase()
      const normalizedInstance = url.origin.toLowerCase()

      // when receiving fqdn from route parameter, we don't have access to partner context
      // so we enforce default Cozy color as background
      setBackgroundColor(colors.primaryColor)

      if (magicCode) {
        startMagicLinkOAuth(normalizedFqdn, magicCode)
      } else {
        setInstanceData({
          fqdn: normalizedFqdn,
          instance: normalizedInstance
        })
      }
    }
  }, [
    navigation,
    route,
    setInstanceData,
    setBackgroundColor,
    startMagicLinkOAuth
  ])

  const setStepReadonly = isReadOnly => {
    setState(oldState => ({
      ...oldState,
      stepReadonly: isReadOnly
    }))
  }

  const setInstanceData = useCallback(
    async ({ instance, fqdn }) => {
      if (await NetService.isOffline())
        NetService.handleOffline(routes.authenticate)

      try {
        const client = await createClient(instance)

        const { kdfIterations, name } = await fetchPublicData(client)

        // we do not want to await for flagship certification in order to make the UI more responsive
        // so do not add `await` keyword here
        client.certifyFlagship()

        setState({
          step: PASSWORD_STEP,
          stepReadonly: false,
          waitForTransition: true,
          requestTransitionStart: false,
          fqdn: fqdn,
          instance: instance,
          name: name,
          kdfIterations: kdfIterations,
          client: client
        })
      } catch (error) {
        setError(error.message, error)
      }
    },
    [setError]
  )

  const cancelOauth = useCallback(() => {
    setState(oldState => {
      if (oldState.isOidc) {
        return {
          step: CLOUDERY_STEP
        }
      }

      return {
        ...oldState,
        step: PASSWORD_STEP,
        stepReadonly: false,
        waitForTransition: false,
        requestTransitionStart: false,
        loginData: undefined,
        sessionCode: undefined,
        errorMessage: undefined,
        errorMessage2FA: undefined
      }
    })
  }, [])

  const cancelLogin = useCallback(() => {
    setState({
      step: CLOUDERY_STEP
    })
  }, [])

  const setLoginData = loginData => {
    setState(oldState => ({
      ...oldState,
      loginData: loginData
    }))
  }

  const startOidcOAuth = async (fqdn, code) => {
    if (await NetService.isOffline())
      NetService.handleOffline(routes.authenticate)

    try {
      const instance = 'https://' + fqdn
      const client = await createClient(instance)

      await client.certifyFlagship()

      const result = await connectOidcClient(client, code)

      if (result.state === STATE_2FA_NEEDED) {
        setState(oldState => ({
          ...oldState,
          step: TWO_FACTOR_AUTHENTICATION_STEP,
          isOidc: true,
          stepReadonly: false,
          client: result.client,
          twoFactorToken: result.twoFactorToken
        }))
      } else if (result.state === STATE_AUTHORIZE_NEEDED) {
        setState(oldState => ({
          ...oldState,
          step: AUTHORIZE_TRANSITION_STEP,
          isOidc: true,
          waitForTransition: true,
          client: result.client,
          sessionCode: result.sessionCode
        }))
      } else {
        showSplashScreen()
        setClient(result.client)
      }
    } catch (error) {
      setError(error.message, error)
    }
  }

  const startMagicLinkOAuth = useCallback(
    async (fqdn, magicCode) => {
      if (await NetService.isOffline())
        NetService.handleOffline(routes.authenticate)

      try {
        const instance = 'https://' + fqdn
        const client = await createClient(instance)

        await client.certifyFlagship()

        const result = await connectMagicLinkClient(client, magicCode)

        if (result.state === STATE_2FA_NEEDED) {
          setState(oldState => ({
            ...oldState,
            step: TWO_FACTOR_AUTHENTICATION_STEP,
            isOidc: true,
            stepReadonly: false,
            client: result.client,
            twoFactorToken: result.twoFactorToken
          }))
        } else if (result.state === STATE_AUTHORIZE_NEEDED) {
          setState(oldState => ({
            ...oldState,
            step: AUTHORIZE_TRANSITION_STEP,
            isOidc: true,
            waitForTransition: true,
            client: result.client,
            sessionCode: result.sessionCode
          }))
        } else {
          showSplashScreen()
          setClient(result.client)
        }
      } catch (error) {
        setError(error.message, error)
      }
    },
    [setClient, setError, showSplashScreen]
  )

  const startOidcOnboarding = (onboardUrl, code) => {
    setState(oldState => ({
      ...oldState,
      step: OIDC_ONBOARD_STEP,
      isOidc: true,
      oidcOnboardUrl: onboardUrl,
      oidcCode: code
    }))
  }

  const startOAuth = useCallback(async () => {
    if (await NetService.isOffline())
      NetService.handleOffline(routes.authenticate)

    try {
      const { loginData, instance, client } = state

      const result = await callInitClient({
        loginData,
        instance,
        client
      })

      if (result.state === STATE_INVALID_PASSWORD) {
        setState(oldState => ({
          ...oldState,
          step: PASSWORD_STEP,
          stepReadonly: false,
          loginData: undefined,
          waitForTransition: false,
          errorMessage: strings.errors.invalidPassword
        }))
      } else if (result.state === STATE_2FA_NEEDED) {
        setState(oldState => ({
          ...oldState,
          step: TWO_FACTOR_AUTHENTICATION_STEP,
          stepReadonly: false,
          client: result.client,
          twoFactorToken: result.twoFactorToken
        }))
      } else if (result.state === STATE_AUTHORIZE_NEEDED) {
        setState(oldState => ({
          ...oldState,
          step: AUTHORIZE_TRANSITION_STEP,
          waitForTransition: true,
          client: result.client,
          sessionCode: result.sessionCode
        }))
      } else {
        showSplashScreen()
        if (!state.isOidc) {
          await resetKeychainAndSaveLoginData(loginData)
        }
        setClient(result.client)
      }
    } catch (error) {
      setError(error.message, error)
    }
  }, [setError, state, setClient, showSplashScreen])

  const continueOAuth = useCallback(
    async twoFactorCode => {
      if (await NetService.isOffline())
        NetService.handleOffline(routes.authenticate)

      try {
        const { loginData, client, twoFactorToken } = state

        const result = await call2FAInitClient({
          loginData,
          client,
          twoFactorAuthenticationData: {
            token: twoFactorToken,
            passcode: twoFactorCode
          }
        })

        if (result.state === STATE_2FA_NEEDED) {
          setState(oldState => ({
            ...oldState,
            step: TWO_FACTOR_AUTHENTICATION_STEP,
            stepReadonly: false,
            client: result.client,
            twoFactorToken: result.twoFactorToken,
            errorMessage2FA: strings.errors.wrong2FA
          }))
        } else if (result.state === STATE_AUTHORIZE_NEEDED) {
          setState(oldState => ({
            ...oldState,
            step: AUTHORIZE_TRANSITION_STEP,
            waitForTransition: true,
            client: result.client,
            sessionCode: result.sessionCode
          }))
        } else {
          showSplashScreen()
          if (!state.isOidc) {
            await resetKeychainAndSaveLoginData(loginData)
          }
          setClient(result.client)
        }
      } catch (error) {
        setError(error.message, error)
      }
    },
    [setError, state, showSplashScreen, setClient]
  )

  const authorize = useCallback(async () => {
    if (await NetService.isOffline())
      NetService.handleOffline(routes.authenticate)

    try {
      const { client, loginData, sessionCode } = state

      const result = await authorizeClient({
        sessionCode,
        client
      })

      showSplashScreen()
      if (!state.isOidc) {
        await resetKeychainAndSaveLoginData(loginData)
      }
      setClient(result.client)
    } catch (error) {
      if (error === OAUTH_USER_CANCELED_ERROR) {
        cancelOauth()
      } else {
        setError(error.message, error)
      }
    }
  }, [cancelOauth, setClient, setError, state, showSplashScreen])

  const setError = useCallback(
    (errorMessage, error) => {
      setState(oldState => ({
        ...oldState,
        step: ERROR_STEP,
        errorMessage: errorMessage,
        error: error,
        previousStep: state.step
      }))
    },
    [state]
  )

  const startTransitionToPassword = avatarPosition => {
    setState(oldState => ({
      ...oldState,
      requestTransitionStart: true,
      passwordAvatarPosition: avatarPosition
    }))
  }

  const endTransitionToPassword = () => {
    setState(oldState => ({
      ...oldState,
      requestTransitionStart: false,
      waitForTransition: false
    }))
  }

  const setTransitionToAuthorizeEnded = useCallback(() => {
    setState(oldState => ({
      ...oldState,
      waitForTransition: false
    }))
  }, [])

  if (state.step === CLOUDERY_STEP) {
    return (
      <ClouderyView
        backgroundColor={backgroundColor}
        clouderyMode={clouderyMode}
        disableAutofocus={disableAutofocus}
        setBackgroundColor={setBackgroundColor}
        setInstanceData={setInstanceData}
        startOidcOAuth={startOidcOAuth}
        startOidcOnboarding={startOidcOnboarding}
        setError={setError}
      />
    )
  }

  if (state.step === PASSWORD_STEP) {
    return (
      <>
        <PasswordView
          instance={state.instance}
          fqdn={state.fqdn}
          kdfIterations={state.kdfIterations}
          name={state.name}
          requestTransitionStart={startTransitionToPassword}
          setKeys={setLoginData}
          setError={setError}
          errorMessage={state.errorMessage}
          goBack={cancelLogin}
          setBackgroundColor={setBackgroundColor}
          readonly={state.stepReadonly}
          setReadonly={setStepReadonly}
          waitForTransition={state.waitForTransition}
        />
        {state.waitForTransition && (
          <TransitionToPasswordView
            setTransitionEnded={endTransitionToPassword}
            requestTransitionStart={state.requestTransitionStart}
            passwordAvatarPosition={state.passwordAvatarPosition}
          />
        )}
      </>
    )
  }

  if (state.step === OIDC_ONBOARD_STEP) {
    return (
      <>
        <OidcOnboardingView
          backgroundColor={backgroundColor}
          onboardUrl={state.oidcOnboardUrl}
          code={state.oidcCode}
          setBackgroundColor={setBackgroundColor}
          startOidcOAuth={startOidcOAuth}
        />
      </>
    )
  }

  if (state.step === TWO_FACTOR_AUTHENTICATION_STEP) {
    return (
      <TwoFactorAuthenticationView
        instance={state.instance}
        setTwoFactorCode={continueOAuth}
        goBack={cancelOauth}
        errorMessage={state.errorMessage2FA}
        readonly={state.stepReadonly}
        setReadonly={setStepReadonly}
      />
    )
  }

  if (state.step === AUTHORIZE_TRANSITION_STEP) {
    return (
      <TransitionToAuthorizeView
        setTransitionEnded={setTransitionToAuthorizeEnded}
      />
    )
  }

  if (state.step === LOADING_STEP) {
    return null
  }

  if (state.step === ERROR_STEP) {
    return (
      <ErrorView
        errorMessage={state.errorMessage}
        error={state.error}
        button={{
          callback: cancelLogin,
          title: 'Restart login'
        }}
      />
    )
  }
}

export const LoginScreen = ({
  clouderyMode,
  disableAutofocus,
  goBack,
  navigation,
  route,
  setClient
}) => {
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
      <LoginSteps
        backgroundColor={backgroundColor}
        clouderyMode={clouderyMode}
        navigation={navigation}
        route={route}
        setBackgroundColor={setBackgroundAndStatusBarColor}
        setClient={setClient}
        disableAutofocus={disableAutofocus}
        goBack={goBack}
      />
      <View
        style={{
          height: dimensions.navbarHeight
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
