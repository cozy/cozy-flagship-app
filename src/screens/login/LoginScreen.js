import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import Minilog from '@cozy/minilog'

import { ClouderyView } from './components/ClouderyView'
import { ErrorView } from './components/ErrorView'
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
  STATE_2FA_NEEDED,
  STATE_AUTHORIZE_NEEDED,
  STATE_INVALID_PASSWORD
} from '/libs/client'
import { getNavbarHeight, statusBarHeight } from '/libs/dimensions'
import { resetKeychainAndSaveLoginData } from '/libs/functions/passwordHelpers'
import { consumeRouteParameter } from '/libs/functions/routeHelpers'
import { useSplashScreen } from '/hooks/useSplashScreen'

import strings from '../../strings.json'
import { getColors } from '/theme/colors'
import { NetService } from '/libs/services/NetService'

const log = Minilog('LoginScreen')

const LOADING_STEP = 'LOADING_STEP'
const CLOUDERY_STEP = 'CLOUDERY_STEP'
const PASSWORD_STEP = 'PASSWORD_STEP'
const TWO_FACTOR_AUTHENTICATION_STEP = 'TWO_FACTOR_AUTHENTICATION_STEP'
const AUTHORIZE_TRANSITION_STEP = 'AUTHORIZE_TRANSITION_STEP'
const ERROR_STEP = 'ERROR_STEP'

const OAUTH_USER_CANCELED_ERROR = 'USER_CANCELED'

const LoginSteps = ({ navigation, route, setClient }) => {
  const { showSplashScreen } = useSplashScreen()
  const [state, setState] = useState({
    step: CLOUDERY_STEP
  })

  useEffect(() => {
    log.debug(`Enter state ${state.step}`)
  }, [state])

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
    if (fqdn) {
      // fqdn string should never contain the protocol, but we may want to enforce it
      // when local debugging as this configuration uses `http` only
      const url =
        fqdn.startsWith('http://') || fqdn.startsWith('https://')
          ? new URL(fqdn)
          : new URL(`https://${fqdn}`)

      const normalizedFqdn = url.host.toLowerCase()
      const normalizedInstance = url.origin.toLowerCase()

      setInstanceData({
        fqdn: normalizedFqdn,
        instance: normalizedInstance
      })
    }
  }, [navigation, route, setInstanceData])

  const setStepReadonly = isReadOnly => {
    setState(oldState => ({
      ...oldState,
      stepReadonly: isReadOnly
    }))
  }

  const setInstanceData = useCallback(
    async ({ instance, fqdn }) => {
      if (await NetService.isOffline()) NetService.handleOffline()

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
    setState(oldState => ({
      ...oldState,
      step: PASSWORD_STEP,
      stepReadonly: false,
      waitForTransition: false,
      requestTransitionStart: false,
      loginData: undefined,
      sessionCode: undefined,
      errorMessage: undefined,
      errorMessage2FA: undefined
    }))
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

  const startOAuth = useCallback(async () => {
    if (await NetService.isOffline()) NetService.handleOffline()

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
        await resetKeychainAndSaveLoginData(loginData)
        setClient(result.client)
      }
    } catch (error) {
      setError(error.message, error)
    }
  }, [setError, state])

  const continueOAuth = useCallback(
    async twoFactorCode => {
      if (await NetService.isOffline()) NetService.handleOffline()

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
          await resetKeychainAndSaveLoginData(loginData)
          setClient(result.client)
        }
      } catch (error) {
        setError(error.message, error)
      }
    },
    [setError, state]
  )

  const authorize = useCallback(async () => {
    if (await NetService.isOffline()) NetService.handleOffline()

    try {
      const { client, loginData, sessionCode } = state

      const result = await authorizeClient({
        sessionCode,
        client
      })

      showSplashScreen()
      await resetKeychainAndSaveLoginData(loginData)
      setClient(result.client)
    } catch (error) {
      if (error === OAUTH_USER_CANCELED_ERROR) {
        cancelOauth()
      } else {
        setError(error.message, error)
      }
    }
  }, [cancelOauth, setClient, setError, state])

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
    return <ClouderyView setInstanceData={setInstanceData} />
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

export const LoginScreen = ({ navigation, route, setClient }) => {
  const colors = getColors()

  return (
    <View
      style={[
        styles.view,
        {
          backgroundColor: colors.primaryColor
        }
      ]}
    >
      <View style={{ height: statusBarHeight }} />
      <LoginSteps navigation={navigation} route={route} setClient={setClient} />
      <View style={{ height: getNavbarHeight() }} />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
