import React, {useLayoutEffect} from 'react'
import {decode, encode} from 'base-64'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {Provider as PaperProvider} from 'react-native-paper'

import {CozyProvider} from 'cozy-client'
import {NativeIntentProvider} from 'cozy-intent'

import * as RootNavigation from './libs/RootNavigation.js'
import {HomeScreen} from './screens/home/HomeScreen'
import {LoginScreen} from './screens/login/LoginScreen'
import {OnboardingScreen} from './screens/login/OnboardingScreen'
import {CozyAppScreen} from './screens/cozy-app/CozyAppScreen'
import {SplashScreenProvider} from './providers/SplashScreenProvider'
import {lightTheme} from './theme'
import {localMethods} from './libs/intents/localMethods'
import {useAppBootstrap} from './hooks/useAppBootstrap.js'
import {routes} from './constants/routes.js'

var httpBridge = require('@cheungpat/react-native-http-bridge')
import {CryptoWebView} from './components/webviews/CryptoWebView/CryptoWebView'

const Root = createStackNavigator()
const Stack = createStackNavigator()

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

const App = () => {
  const {client, setClient, initialScreen, initialRoute, isLoading} =
    useAppBootstrap()

  useLayoutEffect(() => {
    const startHttpBridge = () => {
      // initialize the server (now accessible via localhost:1234)
      httpBridge.start(8080, 'http_service', request => {
        console.log('🐬 inside http bridge start')
        console.log({request})
        // you can use request.url, request.type and request.postData here
        // request.headers.Host => toto
        if (request.type === 'GET' && request.url.split('/')[1] === 'users') {
          httpBridge.respond(
            request.requestId,
            200,
            'application/json',
            '{"message": "OK"}',
          )
        } else {
          httpBridge.respond(
            request.requestId,
            400,
            'application/json',
            '{"message": "Bad Request"}',
          )
        }
      })
      console.log('🐬 end of startHttpBridge')
    }
    setTimeout(() => startHttpBridge(), 1000)
    console.log('timeout done')
    return () => {
      console.log('useLayoutEffect stop')
      httpBridge.stop()
    }
  }, [])

  if (isLoading) {
    return null
  }

  const StackNavigator = () => (
    <Stack.Navigator
      initialRouteName={client ? routes.home : initialScreen.stack}
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name={routes.home}
        component={HomeScreen}
        {...(initialRoute.stack ? {initialParams: initialRoute.stack} : {})}
      />

      <Stack.Screen name={routes.authenticate}>
        {params => <LoginScreen setClient={setClient} {...params} />}
      </Stack.Screen>

      <Stack.Screen
        name={routes.onboarding}
        initialParams={initialScreen.params}>
        {params => <OnboardingScreen setClient={setClient} {...params} />}
      </Stack.Screen>
    </Stack.Navigator>
  )

  const RootNavigator = () => (
    <Root.Navigator
      initialRouteName={initialScreen.root}
      screenOptions={{headerShown: false}}>
      <Root.Screen name={routes.stack} component={StackNavigator} />

      <Root.Screen
        name={routes.cozyapp}
        component={CozyAppScreen}
        options={{
          presentation: 'transparentModal',
          animationEnabled: false,
        }}
        {...(initialRoute.root ? {initialParams: initialRoute.root} : {})}
      />
    </Root.Navigator>
  )

  return client ? (
    <CozyProvider client={client}>
      <RootNavigator />
    </CozyProvider>
  ) : (
    <RootNavigator />
  )
}

const WrappedApp = () => (
  <NavigationContainer ref={RootNavigation.navigationRef}>
    <NativeIntentProvider localMethods={localMethods}>
      <PaperProvider theme={lightTheme}>
        <SplashScreenProvider>
          <CryptoWebView />
          <App />
        </SplashScreenProvider>
      </PaperProvider>
    </NativeIntentProvider>
  </NavigationContainer>
)

export default WrappedApp
