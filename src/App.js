import React from 'react'
import { StyleSheet, View } from 'react-native'
import { decode, encode } from 'base-64'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Provider as PaperProvider } from 'react-native-paper'

import { CozyProvider } from 'cozy-client'
import { NativeIntentProvider } from 'cozy-intent'

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
  const { client, setClient, initialScreen, initialRoute, isLoading } =
    useAppBootstrap()

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
    </Stack.Navigator>
  )

  const RootNavigator = () => (
    <Root.Navigator
      initialRouteName={initialScreen.root}
      screenOptions={{ headerShown: false }}
    >
      <Root.Screen name={routes.stack} component={StackNavigator} />

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

  return client ? (
    <CozyProvider client={client}>
      <RootNavigator />
    </CozyProvider>
  ) : (
    <RootNavigator />
  )
}

const WrappedApp = () => {
  const colors = getColors()

  return (
    <NavigationContainer ref={RootNavigation.navigationRef}>
      <NativeIntentProvider localMethods={localMethods}>
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
              <App />
            </View>
          </SplashScreenProvider>
        </PaperProvider>
      </NativeIntentProvider>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})

export default WrappedApp
