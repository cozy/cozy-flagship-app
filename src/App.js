import React, {useEffect, useState} from 'react'
import {SafeAreaView, StyleSheet} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {Provider as PaperProvider} from 'react-native-paper'

import {decode, encode} from 'base-64'

import {CozyProvider} from 'cozy-client'
import {NativeIntentProvider} from 'cozy-intent'

import * as RootNavigation from './libs/RootNavigation.js'
import {HomeScreen} from './screens/home/HomeScreen'
import {LoginScreen} from './screens/login/LoginScreen'
import {CozyAppScreen} from './screens/cozy-app/CozyAppScreen'
import {SplashScreenProvider} from './providers/SplashScreenProvider'
import {clearClient, getClient} from './libs/client'
import {openApp} from './libs/functions/openApp'
import {lightTheme} from './theme'
import {useSplashScreen} from './hooks/useSplashScreen'

const Root = createStackNavigator()
const MainStack = createStackNavigator()

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

const App = () => {
  const [client, setClient] = useState(null)
  const {hideSplashScreen} = useSplashScreen()

  useEffect(() => {
    getClient().then(clientResult => {
      if (clientResult) {
        setClient(clientResult)
      }

      hideSplashScreen()
    })
  }, [hideSplashScreen])

  const Routing = ({auth}) => (
    <Root.Navigator initialRouteName="main" mode="modal">
      <Root.Screen options={{headerShown: false}} name="main">
        {() => (
          <MainStack.Navigator
            initialRouteName={auth ? 'home' : 'authenticate'}>
            <MainStack.Screen
              name="home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <MainStack.Screen
              name="authenticate"
              options={{headerShown: false}}>
              {() => <LoginScreen setClient={setClient} />}
            </MainStack.Screen>
          </MainStack.Navigator>
        )}
      </Root.Screen>

      <Root.Screen
        name="cozyapp"
        component={CozyAppScreen}
        options={{headerShown: false}}
      />
    </Root.Navigator>
  )

  return client ? (
    <CozyProvider client={client}>
      <Routing auth={true} />
    </CozyProvider>
  ) : (
    <Routing auth={false} />
  )
}

const WrappedApp = () => (
  <NavigationContainer ref={RootNavigation.navigationRef}>
    <NativeIntentProvider
      localMethods={{
        logout: async () => {
          await clearClient()
          return RootNavigation.navigate('authenticate')
        },
        openApp: (href, app) => openApp(RootNavigation, href, app),
      }}>
      <PaperProvider theme={lightTheme}>
        <SplashScreenProvider>
          <SafeAreaView style={styles.container}>
            <App />
          </SafeAreaView>
        </SplashScreenProvider>
      </PaperProvider>
    </NativeIntentProvider>
  </NavigationContainer>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default WrappedApp
