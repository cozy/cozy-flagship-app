import React, { useEffect, useState } from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'

import DebugView from '../connectors/DebugView'
import HomeView from './components/HomeView'
import LauncherView from '../connectors/LauncherView'
import { internalMethods } from '../../libs/intents/localMethods'

const resetUIState = () => {
  internalMethods.setFlagshipUI({
    topTheme: 'light',
    bottomTheme: 'light'
  })

  Platform.OS !== 'ios' && StatusBar?.setBackgroundColor('transparent')
}

export const HomeScreen = ({ route, navigation }) => {
  const [debug] = useState(false)
  const [launcherContext, setLauncherContext] = useState({
    state: 'default'
  })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', resetUIState)
    return unsubscribe
  }, [navigation])

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
