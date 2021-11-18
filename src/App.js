import React, {useEffect, useState} from 'react'
import {SafeAreaView, StyleSheet, View, Linking} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {Provider as PaperProvider, TextInput, Button} from 'react-native-paper'

import {decode, encode} from 'base-64'

import {CozyProvider} from 'cozy-client'

import {lightTheme} from './theme'
import Connectors from './screens/connectors'
import StoreView from './screens/store/StoreView'
import {getClient, saveClient, initClient} from './libs/client'

const Root = createStackNavigator()

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

const COZY_PREFIX = 'cozy://'

const Authenticate = ({setClient}) => {
  const [uri, setUri] = useState(null)
  const [busy, setBusy] = useState(false)

  return (
    <View>
      <TextInput
        label="Cozy url"
        placeholder="https://testchristophe.cozy.works"
        onChange={(event) => setUri(event.nativeEvent.text)}
      />
      <Button
        busy={busy}
        onPress={async () => {
          setBusy(true)
          const clientResult = await callInitClient(uri)
          await setClient(clientResult)
          setBusy(false)
        }}>
        Submit
      </Button>
    </View>
  )
}

const App = () => {
  const [client, setClient] = useState(null)

  useEffect(() => {
    getClient().then((clientResult) => {
      if (clientResult) {
        setClient(clientResult)
      }
    })
  }, [])

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

const callInitClient = async (uri) => {
  const client = await initClient(uri, {
    scope: [
      'io.cozy.apps',
      'io.cozy.settings',
      'io.cozy.konnectors',
      'io.cozy.jobs',
      'io.cozy.contacts',
      'io.cozy.triggers',
      'io.cozy.permissions',
      'io.cozy.apps.suggestions',
      'com.bitwarden.organizations',
      'com.bitwarden.ciphers',
      'io.cozy.bank.accounts',
      'io.cozy.timeseries.geojson',
      'io.cozy.files.*',
      'io.cozy.bills',
      'io.cozy.accounts',
      'io.cozy.identities',
    ],
    oauth: {
      redirectURI: COZY_PREFIX,
      softwareID: 'amiral',
      clientKind: 'mobile',
      clientName: 'Amiral',
    },
  })
  await saveClient(client)
  return client
}

const AppSafeView = () => (
  <SafeAreaView style={styles.container}>
    <App />
  </SafeAreaView>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default AppSafeView
