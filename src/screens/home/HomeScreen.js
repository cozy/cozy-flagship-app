import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import DebugView from '../connectors/DebugView'
import HomeView from './components/HomeView'
import LauncherView from '../connectors/LauncherView'

export const HomeScreen = ({ route, navigation }) => {
  const [debug] = useState(false)
  const [launcherContext, setLauncherContext] = useState({
    state: 'default'
  })

  return (
    <View style={styles.container}>
      <HomeView
        setLauncherContext={setLauncherContext}
        navigation={navigation}
        route={route}
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
