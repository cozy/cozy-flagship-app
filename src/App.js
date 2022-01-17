import React, {useEffect, useState} from 'react'
import {SafeAreaView, StyleSheet} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {Provider as PaperProvider} from 'react-native-paper'

import {decode, encode} from 'base-64'

import {CozyProvider} from 'cozy-client'
import {NativeIntentProvider} from 'cozy-intent'

import {lightTheme} from './theme'
import Connectors from './screens/connectors'
import StoreView from './screens/store/StoreView'
import {getClient} from './libs/client'
import {Authenticate} from './screens/Authenticate'
import {useSplashScreen} from './hooks/useSplashScreen'
import {SplashScreenProvider} from './screens/providers/SplashScreenProvider'
import {CozyAppView} from './screens/routes/CozyAppView'
import {Scanner} from './screens/scanner/DocumentScanner'
import {OCR} from './screens/scanner/OCR'

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
    getClient().then((clientResult) => {
      if (clientResult) {
        setClient(clientResult)
      }

      hideSplashScreen()
    })
  }, [hideSplashScreen])

  const Routing = ({auth}) => (
    <NavigationContainer>
      <NativeIntentProvider>
        <Root.Navigator initialRouteName="main" mode="modal">
          <Root.Screen options={{headerShown: false}} name="main">
            {() => (
              <MainStack.Navigator
                initialRouteName={auth ? 'home' : 'authenticate'}>
                <MainStack.Screen
                  name="home"
                  component={Connectors}
                  options={{headerShown: false}}
                />
                <MainStack.Screen
                  name="store"
                  component={StoreView}
                  options={{headerShown: false}}
                />
                <MainStack.Screen
                  name="authenticate"
                  options={{headerShown: false}}>
                  {() => <Authenticate setClient={setClient} />}
                </MainStack.Screen>
                <MainStack.Screen
                  name="scanner"
                  options={{headerShown: false}}
                  component={Scanner}
                />
                <MainStack.Screen
                  name="OCR"
                  options={{headerShown: false}}
                  component={OCR}
                />
              </MainStack.Navigator>
            )}
          </Root.Screen>

          <Root.Screen
            name="cozyapp"
            component={CozyAppView}
            options={{headerShown: false}}
          />
        </Root.Navigator>
      </NativeIntentProvider>
    </NavigationContainer>
  )

  return (
    <PaperProvider theme={lightTheme}>
      {client ? (
        <CozyProvider client={client}>
          <Routing auth={true} />
        </CozyProvider>
      ) : (
        <Routing auth={false} />
      )}
    </PaperProvider>
  )
}

const WrappedApp = () => (
  <SplashScreenProvider>
    <SafeAreaView style={styles.container}>
      <App />
    </SafeAreaView>
  </SplashScreenProvider>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default WrappedApp
