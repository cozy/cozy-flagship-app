import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'
import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'

import HomeView from '/screens/home/components/HomeView'
import LauncherView from '/screens/connectors/LauncherView'
import { StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { styles } from '/screens/home/HomeScreen.styles'
import { useLauncherContext } from '/screens/home/hooks/useLauncherContext'

interface HomeScreenProps {
  navigation: NavigationProp<ParamListBase>
  route: RouteProp<ParamListBase>
}

export const HomeScreen = ({
  navigation,
  route
}: HomeScreenProps): JSX.Element => {
  const [barStyle, setBarStyle] = useState(StatusBarStyle.Light)
  const {
    LauncherDialog,
    canDisplayLauncher,
    launcherClient,
    launcherContext,
    resetLauncherContext,
    setLauncherContext,
    trySetLauncherContext
  } = useLauncherContext()

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} />

      <HomeView
        navigation={navigation}
        route={route}
        setBarStyle={setBarStyle}
        setLauncherContext={trySetLauncherContext}
      />

      {canDisplayLauncher() && (
        <LauncherView
          launcherClient={launcherClient}
          launcherContext={launcherContext.value}
          retry={resetLauncherContext}
          setLauncherContext={setLauncherContext}
        />
      )}

      {LauncherDialog}
    </View>
  )
}
