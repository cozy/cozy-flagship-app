import React, {useEffect, useState} from 'react'
import {StatusBar, StyleSheet, View} from 'react-native'

import HomeView from './components/HomeView'
import LauncherView from '../connectors/LauncherView'
import DebugView from '../connectors/DebugView'
import {setFlagshipUI} from '../../libs/intents/setFlagshipUI'

const resetUIState = () => {
  setFlagshipUI({
    topTheme: 'light',
    bottomTheme: 'light',
  })

  StatusBar?.setBackgroundColor('transparent')
}

export const HomeScreen = ({route, navigation}) => {
  const [debug] = useState(false)
  const [launcherContext, setLauncherContext] = useState({
    state: 'default',
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
    justifyContent: 'center',
  },
})
