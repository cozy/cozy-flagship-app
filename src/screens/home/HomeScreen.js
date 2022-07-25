import React, { useState } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'

import DebugView from '../connectors/DebugView'
import HomeView from './components/HomeView'
import LauncherView from '../connectors/LauncherView'

export const HomeScreen = ({ route, navigation }) => {
  const [debug] = useState(false)
  const [barStyle, setBarStyle] = useState('light-content')
  const [launcherContext, setLauncherContext] = useState({
    state: 'default'
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} />

      <HomeView
        setLauncherContext={setLauncherContext}
        navigation={navigation}
        route={route}
        setBarStyle={setBarStyle}
      />

      {debug && <DebugView />}

      {launcherContext.state === 'launch' && (
        <LauncherView
          launcherContext={launcherContext.value}
          setLauncherContext={setLauncherContext}
          retry={() => setLauncherContext(null)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
})
