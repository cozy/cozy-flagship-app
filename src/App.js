import React, {useEffect, useState} from 'react'

import {NavigationContainer} from '@react-navigation/native'
import {Provider as PaperProvider, TextInput, Button} from 'react-native-paper'
import {lightTheme} from './theme'
import AppNavigator from './navigator'
import {View} from 'react-native'
import {getClient, saveClient, initClient, clearClient} from './libs/client'
import {CozyProvider} from 'cozy-client'

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
  prefixes: ['cozy://'],
  config,
}

const App = () => {
  const [state, setState] = useState({})
  useEffect(() => {
    getClient().then((client) => {
      if (client) {
        setState({client})
      }
    })
  })

  return (
    <PaperProvider theme={lightTheme}>
      {state.client ? (
        <CozyProvider client={state.client}>
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </CozyProvider>
      ) : (
        <View>
          <TextInput
            label="Cozy url"
            placeholder="https://testchristophe.cozy.works"
            onChange={(event) => setState({uri: event.nativeEvent.text})}
          />
          <Button onPress={() => callInitClient(state, setState)}>
            Submit
          </Button>
        </View>
      )}
    </PaperProvider>
  )
}

const callInitClient = async (state, setState) => {
  const client = await initClient(state.uri)
  await saveClient(client)
  setState({client})
}

export default App
