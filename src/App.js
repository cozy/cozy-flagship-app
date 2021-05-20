import React, {useEffect, useState} from 'react'

import {NavigationContainer} from '@react-navigation/native'
import {Provider as PaperProvider, TextInput, Button} from 'react-native-paper'
import {lightTheme} from './theme'
import AppNavigator from './navigator'
import {View} from 'react-native'
import {getClient, saveClient, initClient, clearClient} from './libs/client'
import {CozyProvider} from 'cozy-client'

const COZY_PREFIX = 'cozy://'

const config = {
  screens: {
    Home: {
      screens: {
        FileListPage: 'file-list',
        Details: 'details',
      },
    },
    Settings: 'settings',
    Konnectors: 'konnectors',
  },
}

const linking = {
  prefixes: [COZY_PREFIX],
  config,
}

const App = () => {
  const [client, setClient] = useState(null)
  const [uri, setUri] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    getClient().then((clientResult) => {
      if (clientResult) {
        setClient(clientResult)
      }
    })
  }, [])

  return (
    <PaperProvider theme={lightTheme}>
      {client ? (
        <CozyProvider client={client}>
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </CozyProvider>
      ) : (
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
              setClient(clientResult)
              setBusy(false)
            }}>
            Submit
          </Button>
        </View>
      )}
    </PaperProvider>
  )
}

const callInitClient = async (uri) => {
  const client = await initClient(uri, {
    oauth: {
      redirectURI: COZY_PREFIX,
      softwareID: 'amiral',
      clientKind: 'mobile',
      clientName: 'Amiral',
    },
  })
  await saveClient(client)
}

export default App
