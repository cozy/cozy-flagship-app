import React, {useEffect, useState} from 'react'
import {SafeAreaView, StyleSheet} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {Provider as PaperProvider} from 'react-native-paper'

import {decode, encode} from 'base-64'

import {CozyProvider} from 'cozy-client'

import {lightTheme} from './theme'
import Connectors from './screens/connectors'
import StoreView from './screens/store/StoreView'
import {getClient} from './libs/client'
import {Authenticate} from './screens/Authenticate'
import {useSplashScreen} from './hooks/useSplashScreen'
import {SplashScreenProvider} from './screens/providers/SplashScreenProvider'

const Root = createStackNavigator()

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
      <Root.Navigator initialRouteName={auth ? 'home' : 'authenticate'}>
        <Root.Screen
          name="home"
          component={Connectors}
          options={{headerShown: false}}
        />
        <Root.Screen name="store" component={StoreView} />
        <Root.Screen name="authenticate">
          {() => <Authenticate setClient={setClient} />}
        </Root.Screen>
      </Root.Navigator>
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
