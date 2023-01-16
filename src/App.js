import AsyncStorage from '@react-native-async-storage/async-storage'
import FlipperAsyncStorage from 'rn-flipper-async-storage-advanced'
import RNAsyncStorageFlipper from 'rn-async-storage-flipper'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar, StyleSheet, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { decode, encode } from 'base-64'

import { CozyProvider, useClient } from 'cozy-client'
import { NativeIntentProvider } from 'cozy-intent'

import * as RootNavigation from '/libs/RootNavigation'
import NetStatusBoundary from '/libs/services/NetStatusBoundary'
import { CozyAppScreen } from '/screens/cozy-app/CozyAppScreen'
import { CreateInstanceScreen } from '/screens/login/CreateInstanceScreen'
import { CryptoWebView } from '/components/webviews/CryptoWebView/CryptoWebView'
import { ErrorScreen } from '/screens/error/ErrorScreen'
import { HomeScreen } from '/screens/home/HomeScreen'
import { HttpServerProvider } from '/libs/httpserver/httpServerProvider'
import { LockScreen } from '/screens/lock/LockScreen'
import { LoginScreen } from '/screens/login/LoginScreen'
import { OnboardingScreen } from '/screens/login/OnboardingScreen'
import { SplashScreenProvider } from '/components/providers/SplashScreenProvider'
import { WelcomeScreen } from '/screens/welcome/WelcomeScreen'
import { getClient } from '/libs/client'
import { getColors } from '/ui/colors'
import { localMethods } from '/libs/intents/localMethods'
import { routes } from '/constants/routes.js'
import { useAppBootstrap } from '/hooks/useAppBootstrap.js'
import { useCookieResyncOnResume } from '/hooks/useCookieResyncOnResume'
import { useGlobalAppState } from '/hooks/useGlobalAppState'
import { useNetService } from '/libs/services/NetService'
import { withSentry } from '/libs/monitoring/Sentry'

const Root = createStackNavigator()
const Stack = createStackNavigator()

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

const App = ({ setClient }) => {
  const client = useClient()

  useNetService(client)

  const { initialScreen, initialRoute, isLoading } = useAppBootstrap(
    client,
    setClient
  )

  useGlobalAppState()
  useCookieResyncOnResume()

  if (isLoading) {
    return null
  }

  const StackNavigator = () => (
    <Stack.Navigator
      initialRouteName={client ? routes.home : initialScreen.stack}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={routes.home}
        component={HomeScreen}
        {...(initialRoute.stack ? { initialParams: initialRoute.stack } : {})}
      />

      <Stack.Screen
        name={routes.authenticate}
        initialParams={initialScreen.params}
      >
        {params => <LoginScreen setClient={setClient} {...params} />}
      </Stack.Screen>

      <Stack.Screen
        name={routes.onboarding}
        initialParams={initialScreen.params}
      >
        {params => <OnboardingScreen setClient={setClient} {...params} />}
      </Stack.Screen>

      <Stack.Screen
        name={routes.instanceCreation}
        initialParams={initialScreen.params}
      >
        {params => <CreateInstanceScreen {...params} />}
      </Stack.Screen>

      <Stack.Screen name={routes.welcome}>
        {params => <WelcomeScreen setClient={setClient} {...params} />}
      </Stack.Screen>
    </Stack.Navigator>
  )

  const RootNavigator = () => (
    <Root.Navigator
      initialRouteName={initialScreen.root}
      screenOptions={{ headerShown: false }}
    >
      <Root.Screen name={routes.stack} component={StackNavigator} />

      <Root.Screen
        name={routes.error}
        component={ErrorScreen}
        initialParams={{ type: initialRoute.root }}
      />

      <Root.Screen
        name={routes.cozyapp}
        component={CozyAppScreen}
        options={{
          presentation: 'transparentModal',
          animationEnabled: false
        }}
        {...(initialRoute.root ? { initialParams: initialRoute.root } : {})}
      />

      <Root.Screen
        name={routes.lock}
        component={LockScreen}
        options={{
          presentation: 'transparentModal',
          animationEnabled: false
        }}
      />
    </Root.Navigator>
  )

  return <RootNavigator />
}

const WrappedApp = () => {
  const colors = getColors()
  const [client, setClient] = useState(undefined)

  useEffect(() => {
    const handleClientInit = async () => {
      try {
        setClient((await getClient()) || null)
      } catch {
        setClient(null)
      }
    }

    handleClientInit()
  }, [])

  const Nav = () => (
    <NavigationContainer ref={RootNavigation.navigationRef}>
      <NativeIntentProvider localMethods={localMethods(client)}>
        <View
          style={[
            styles.view,
            {
              backgroundColor: colors.primaryColor
            }
          ]}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          <App setClient={setClient} />
        </View>
      </NativeIntentProvider>
    </NavigationContainer>
  )

  if (client === null) return <Nav />

  if (client)
    return (
      <CozyProvider client={client}>
        <Nav />
      </CozyProvider>
    )

  return null
}

const Wrapper = () => {
  const [hasCrypto, setHasCrypto] = useState(false)
  useEffect(() => {
    if (__DEV__) {
      RNAsyncStorageFlipper(AsyncStorage)
    }
  }, [])
  return (
    <>
      {__DEV__ && <FlipperAsyncStorage />}
      <CryptoWebView setHasCrypto={setHasCrypto} />
      {hasCrypto && (
        <HttpServerProvider>
          <SplashScreenProvider>
            <NetStatusBoundary>
              <WrappedApp />
            </NetStatusBoundary>
          </SplashScreenProvider>
        </HttpServerProvider>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})

export default withSentry(Wrapper)
