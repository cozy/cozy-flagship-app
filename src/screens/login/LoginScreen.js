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
  authorizeClientAndLogin,
  createClient,
  fetchPublicData,
  connectMagicLinkClient,
  connectOidcClient
} from '/libs/client'
import {
  STATE_2FA_NEEDED,
  STATE_2FA_PASSWORD_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_INVALID_PASSWORD
} from '/libs/clientHelpers/types'
import { resetKeychainAndSaveLoginData } from '/libs/functions/passwordHelpers'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { useSplashScreen } from '/hooks/useSplashScreen'
import strings from '/constants/strings.json'
import { getColors } from '/ui/colors'
import { NetService } from '/libs/services/NetService'
import { routes } from '/constants/routes'
import { setStatusBarColorToMatchBackground } from '/screens/login/components/functions/clouderyBackgroundFetcher'
import { getInstanceFromFqdn } from '/screens/login/components/functions/getInstanceFromFqdn'
import { getInstanceDataFromFqdn } from '/screens/login/components/functions/getInstanceDataFromRequest'

const log = Minilog('LoginScreen')

const LOADING_STEP = 'LOADING_STEP'
const CLOUDERY_STEP = 'CLOUDERY_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const OIDC_ONBOARD_STEP = 'OIDC_ONBOARD_STEP'
const TWO_FACTOR_AUTHENTICATION_STEP = 'TWO_FACTOR_AUTHENTICATION_STEP'
const TWO_FACTOR_AUTHENTICATION_PASSWORD_STEP =
  'TWO_FACTOR_AUTHENTICATION_PASSWORD_STEP'
const AUTHORIZE_TRANSITION_STEP = 'AUTHORIZE_TRANSITION_STEP'
const ERROR_STEP = 'ERROR_STEP'

const OAUTH_USER_CANCELED_ERROR = 'USER_CANCELED'

const colors = getColors()

const LoginSteps = ({
  clouderyMode,
  clouderyTheme,
  disableAutofocus,
  goBack,
  navigation,
  route,
  setClient,
  setClouderyTheme
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
      const instanceData = getInstanceDataFromFqdn(fqdn)

      // when receiving fqdn from route parameter, we don't have access to partner context
      // so we enforce default Cozy color as background
      setClouderyTheme({
        backgroundColor: colors.primaryColor
      })

      if (magicCode) {
        startMagicLinkOAuth(instanceData.fqdn, magicCode)
      } else {
        setInstanceData(instanceData)
      }
    }
  }, [
    navigation,
    route,
    setClouderyTheme,
    setInstanceData,
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
      if (oldState.isOidc || oldState.isMagicLink) {
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
      const instance = getInstanceFromFqdn(fqdn)
      const client = await createClient(instance)

      await client.certifyFlagship()

      const result = await connectOidcClient(client, code)

      if (result.state === STATE_2FA_NEEDED) {
        setState(oldState => ({
          ...oldState,
          step: TWO_FACTOR_AUTHENTICATION_STEP,
          isOidc: true,
          oidcCode: code,
          instance: instance,
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
        const instance = getInstanceFromFqdn(fqdn)
        const client = await createClient(instance)

        await client.certifyFlagship()

        const result = await connectMagicLinkClient(client, magicCode)

        if (result.state === STATE_2FA_PASSWORD_NEEDED) {
          const { kdfIterations, name } = await fetchPublicData(client)
          setState(oldState => ({
            ...oldState,
            step: TWO_FACTOR_AUTHENTICATION_PASSWORD_STEP,
            isMagicLink: true,
            client: result.client,
            fqdn: fqdn,
            instance: instance,
            kdfIterations: kdfIterations,
            magicCode: magicCode,
            name: name,
            requestTransitionStart: false,
            stepReadonly: false,
            waitForTransition: true
          }))
        } else if (result.state === STATE_AUTHORIZE_NEEDED) {
          setState(oldState => ({
            ...oldState,
            step: AUTHORIZE_TRANSITION_STEP,
            isMagicLink: true,
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
        if (loginData) {
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
        const { loginData, client, twoFactorToken, isOidc, oidcCode } = state

        let result
        if (isOidc) {
          result = await connectOidcClient(client, oidcCode, {
            token: twoFactorToken,
            passcode: twoFactorCode
          })
        } else {
          result = await call2FAInitClient({
            loginData,
            client,
            twoFactorAuthenticationData: {
              token: twoFactorToken,
              passcode: twoFactorCode
            }
          })
        }

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
          if (loginData) {
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

  const continueMagicLinkOAuth = useCallback(
    async loginData => {
      if (await NetService.isOffline())
        NetService.handleOffline(routes.authenticate)

      try {
        const { client, magicCode } = state

        const result = await connectMagicLinkClient(
          client,
          magicCode,
          loginData.passwordHash
        )

        if (result.state === STATE_INVALID_PASSWORD) {
          setState(oldState => ({
            ...oldState,
            client: result.client,
            errorMessage: strings.errors.invalidPassword,
            stepReadonly: false
          }))
        } else if (result.state === STATE_2FA_PASSWORD_NEEDED) {
          setState(oldState => ({
            ...oldState,
            step: TWO_FACTOR_AUTHENTICATION_PASSWORD_STEP,
            client: result.client,
            errorMessage: strings.errors.invalidPassword,
            stepReadonly: false
          }))
        } else if (result.state === STATE_AUTHORIZE_NEEDED) {
          setState(oldState => ({
            ...oldState,
            step: AUTHORIZE_TRANSITION_STEP,
            client: result.client,
            loginData,
            sessionCode: result.sessionCode,
            waitForTransition: true
          }))
        } else {
          showSplashScreen()
          if (loginData) {
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

      const result = await authorizeClientAndLogin({
        sessionCode,
        client
      })

      showSplashScreen()
      if (loginData) {
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
        clouderyTheme={clouderyTheme}
        clouderyMode={clouderyMode}
        disableAutofocus={disableAutofocus}
        setClouderyTheme={setClouderyTheme}
        setInstanceData={setInstanceData}
        startOidcOAuth={startOidcOAuth}
        startOidcOnboarding={startOidcOnboarding}
        setError={setError}
      />
    )
  }

  if (state.step === PASSWORD_STEP) {
    const enforcedCozyBlueBackground = {
      backgroundColor: colors.primaryColor
    }
    return (
      <>
        <PasswordView
          clouderyTheme={enforcedCozyBlueBackground}
          instance={state.instance}
          fqdn={state.fqdn}
          kdfIterations={state.kdfIterations}
          name={state.name}
          requestTransitionStart={startTransitionToPassword}
          setKeys={setLoginData}
          setError={setError}
          errorMessage={state.errorMessage}
          goBack={cancelLogin}
          readonly={state.stepReadonly}
          setReadonly={setStepReadonly}
          waitForTransition={state.waitForTransition}
        />
        {state.waitForTransition && (
          <TransitionToPasswordView
            backgroundColor={enforcedCozyBlueBackground.backgroundColor}
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
          clouderyTheme={clouderyTheme}
          onboardUrl={state.oidcOnboardUrl}
          code={state.oidcCode}
          setClouderyTheme={setClouderyTheme}
          startOidcOAuth={startOidcOAuth}
        />
      </>
    )
  }

  if (state.step === TWO_FACTOR_AUTHENTICATION_STEP) {
    return (
      <TwoFactorAuthenticationView
        clouderyTheme={clouderyTheme}
        instance={state.instance}
        setTwoFactorCode={continueOAuth}
        goBack={cancelOauth}
        errorMessage={state.errorMessage2FA}
        readonly={state.stepReadonly}
        setReadonly={setStepReadonly}
      />
    )
  }

  if (state.step === TWO_FACTOR_AUTHENTICATION_PASSWORD_STEP) {
    const enforcedPartnerTheme = {
      backgroundColor: colors.paperBackgroundColor,
    }
    return (
      <>
        <PasswordView
          clouderyTheme={enforcedPartnerTheme}
          instance={state.instance}
          fqdn={state.fqdn}
          kdfIterations={state.kdfIterations}
          name={state.name}
          requestTransitionStart={startTransitionToPassword}
          setKeys={continueMagicLinkOAuth}
          setError={setError}
          errorMessage={state.errorMessage}
          goBack={cancelLogin}
          setClouderyTheme={setClouderyTheme}
          readonly={state.stepReadonly}
          setReadonly={setStepReadonly}
          waitForTransition={state.waitForTransition}
        />
        {state.waitForTransition && (
          <TransitionToPasswordView
            backgroundColor={enforcedPartnerTheme.backgroundColor}
            setTransitionEnded={endTransitionToPassword}
            requestTransitionStart={state.requestTransitionStart}
            passwordAvatarPosition={state.passwordAvatarPosition}
          />
        )}
      </>
    )
  }

  if (state.step === AUTHORIZE_TRANSITION_STEP) {
    return (
      <TransitionToAuthorizeView
        setTransitionEnded={setTransitionToAuthorizeEnded}
        backgroundColor={clouderyTheme.backgroundColor}
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
  const [clouderyTheme, setClouderyTheme] = useState({
    backgroundColor: colors.primaryColor
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
      <LoginSteps
        clouderyMode={clouderyMode}
        clouderyTheme={clouderyTheme}
        navigation={navigation}
        route={route}
        setClient={setClient}
        setClouderyTheme={setClouderyThemeAndStatusBarColor}
        disableAutofocus={disableAutofocus}
        goBack={goBack}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
