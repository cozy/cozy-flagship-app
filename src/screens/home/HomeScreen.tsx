import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'

import DebugView from '/screens/connectors/DebugView'
import HomeView from '/screens/home/components/HomeView'
import LauncherView from '/screens/connectors/LauncherView'
import { StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { styles } from '/screens/home/HomeScreen.styles'

export const HomeScreen = ({ route, navigation }) => {
  const [barStyle, setBarStyle] = useState(StatusBarStyle.Light)
  const [debug] = useState(false)
  const [launcherContext, setLauncherContext] = useState({ state: 'default' })

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} />

      <HomeView
        navigation={navigation}
        route={route}
        setBarStyle={setBarStyle}
        setLauncherContext={setLauncherContext}
      />

      {debug && <DebugView />}

      {launcherContext.state === 'launch' && (
        <LauncherView
          launcherContext={launcherContext.value}
          retry={() => setLauncherContext(null)}
          setLauncherContext={setLauncherContext}
        />
      )}
    </View>
  )
}
