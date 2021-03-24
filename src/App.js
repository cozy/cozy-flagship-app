import React from 'react'

import {NavigationContainer} from '@react-navigation/native'
import {Provider as PaperProvider} from 'react-native-paper'
import {lightTheme} from './theme'
import AppNavigator from './navigator'

const config = {
  screens: {
    Home: {
      screens: {
        FileListPage: 'file-list',
        Details: 'details',
      },
    },
    Settings: 'settings',
  },
}

const linking = {
  config,
}

const App = () => {
  return (
    <PaperProvider theme={lightTheme}>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  )
}

export default App
