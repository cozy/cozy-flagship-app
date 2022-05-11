import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { decode, encode } from 'base-64'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Provider as PaperProvider } from 'react-native-paper'

import { CozyProvider, useClient } from 'cozy-client'
import { NativeIntentProvider } from 'cozy-intent'

import { getClient } from './libs/client'
import * as RootNavigation from './libs/RootNavigation.js'
import { HomeScreen } from './screens/home/HomeScreen'
import { LoginScreen } from './screens/login/LoginScreen'
import { OnboardingScreen } from './screens/login/OnboardingScreen'
import { CozyAppScreen } from './screens/cozy-app/CozyAppScreen'
import { SplashScreenProvider } from './providers/SplashScreenProvider'
import { lightTheme } from './theme'
import { getColors } from './theme/colors'
import { localMethods } from './libs/intents/localMethods'
import { useAppBootstrap } from './hooks/useAppBootstrap.js'
import { routes } from './constants/routes.js'
import { CryptoWebView } from './components/webviews/CryptoWebView/CryptoWebView'
import { withSentry } from './Sentry'
import { ErrorScreen } from './screens/error/ErrorScreen.jsx'
import { WelcomeScreen } from './screens/welcome/WelcomeScreen'

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
  const { initialScreen, initialRoute, isLoading } = useAppBootstrap(
    client,
    setClient
  )

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

      <Stack.Screen name={routes.authenticate}>
        {params => <LoginScreen setClient={setClient} {...params} />}
      </Stack.Screen>

      <Stack.Screen
        name={routes.onboarding}
        initialParams={initialScreen.params}
      >
        {params => <OnboardingScreen setClient={setClient} {...params} />}
      </Stack.Screen>

      <Stack.Screen component={WelcomeScreen} name={routes.welcome} />
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
        options={{ type: initialRoute.root }}
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
    </Root.Navigator>
  )

  return <RootNavigator />
}

const WrappedApp = () => {
  const colors = getColors()
  const [client, setClient] = useState(null)

  // Handling client init
  useEffect(() => {
    const asyncCore = async () => {
      try {
        setClient((await getClient()) || undefined)
      } catch {
        setClient(undefined)
      }
    }
    asyncCore()
  }, [])

  const Nav = () => (
    <NavigationContainer ref={RootNavigation.navigationRef}>
      <NativeIntentProvider localMethods={localMethods(client)}>
        <PaperProvider theme={lightTheme}>
          <SplashScreenProvider>
            <View
              style={[
                styles.view,
                {
                  backgroundColor: colors.primaryColor
                }
              ]}
            >
              <CryptoWebView />
              <App setClient={setClient} />
            </View>
          </SplashScreenProvider>
        </PaperProvider>
      </NativeIntentProvider>
    </NavigationContainer>
  )

  return client ? (
    <CozyProvider client={client}>
      <Nav />
    </CozyProvider>
  ) : (
    <Nav />
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})

export default withSentry(WrappedApp)
