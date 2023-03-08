import AsyncStorage from '@react-native-async-storage/async-storage'
import FlipperAsyncStorage from 'rn-flipper-async-storage-advanced'
import RNAsyncStorageFlipper from 'rn-async-storage-flipper'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
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
import { cleanKonnectorsOnBootInBackground } from '/libs/konnectors/cleanKonnectorsOnBoot'
import { getClient } from '/libs/client'
import { getColors } from '/ui/colors'
import { localMethods } from '/libs/intents/localMethods'
import { persistor, store } from '/redux/store'
import { routes } from '/constants/routes.js'
import { useAppBootstrap } from '/hooks/useAppBootstrap.js'
import { useGlobalAppState } from '/hooks/useGlobalAppState'
import { useCookieResyncOnResume } from '/hooks/useCookieResyncOnResume'
import { useCozyEnvironmentOverride } from '/hooks/useCozyEnvironmentOverride'
import { useNotifications } from '/hooks/useNotifications'
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

  const { initialRoute, isLoading } = useAppBootstrap(client)

  useGlobalAppState()
  useCookieResyncOnResume()
  useNotifications()
  useCozyEnvironmentOverride()

  if (isLoading) {
    return null
  }

  const MainAppNavigator = () => (
    <Root.Navigator
      initialRouteName={routes.default}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={routes.default}
        component={HomeScreen}
        initialParams={initialRoute.params}
      />
    </Root.Navigator>
  )

  const RootNavigator = () => (
    <Root.Navigator
      initialRouteName={initialRoute.route}
      screenOptions={{ headerShown: false }}
    >
      {/*
      We embed routes.home into its own Navigator so we prevent initialParams
      to be re-applied when calling goBack() from the CozyApp route
      i.e:
       - We open the app with a deeplink https://links.mycozy.cloud/flagship/drive/?fallback=http://drive.cozy.tools:8080/
       - routes.home is called with {initialParams:{cozyAppFallbackURL: 'http://drive.cozy.tools:8080/'}}
       - routes.home reads initialParams and redirects to routes.cozyapp
       - user press the back button so the app redirects to routes.home
       - routes.home SHOULD NOT read initialParams and SHOULD NOT redirect to routes.cozyapp
      */}
      <Root.Screen name={routes.home} component={MainAppNavigator} />

      <Stack.Screen
        name={routes.authenticate}
        initialParams={initialRoute.params}
      >
        {params => <LoginScreen setClient={setClient} {...params} />}
      </Stack.Screen>

      <Stack.Screen
        name={routes.onboarding}
        initialParams={initialRoute.params}
      >
        {params => <OnboardingScreen setClient={setClient} {...params} />}
      </Stack.Screen>

      <Stack.Screen
        name={routes.instanceCreation}
        initialParams={initialRoute.params}
      >
        {params => <CreateInstanceScreen {...params} />}
      </Stack.Screen>

      <Stack.Screen name={routes.welcome}>
        {params => <WelcomeScreen setClient={setClient} {...params} />}
      </Stack.Screen>

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
        const existingClient = await getClient()
        if (existingClient) {
          cleanKonnectorsOnBootInBackground(existingClient)
        }
        setClient(existingClient || null)
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
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <HttpServerProvider>
              <SplashScreenProvider>
                <NetStatusBoundary>
                  <WrappedApp />
                </NetStatusBoundary>
              </SplashScreenProvider>
            </HttpServerProvider>
          </PersistGate>
        </Provider>
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
