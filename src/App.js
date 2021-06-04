import React, {useEffect, useState} from 'react'
import {View} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import {Provider as PaperProvider, TextInput, Button} from 'react-native-paper'

import {decode, encode} from 'base-64'

import {CozyProvider} from 'cozy-client'

import {lightTheme} from './theme'
import Connectors from './screens/connectors'
import {getClient, saveClient, initClient} from './libs/client'

// Polyfill needed for cozy-client connection
if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

const COZY_PREFIX = 'cozy://'

const config = {
  screens: {
    connectors: 'connectors',
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
            <Connectors />
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

export default App
