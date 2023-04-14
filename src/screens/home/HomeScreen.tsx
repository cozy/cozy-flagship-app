import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'
import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'

import HomeView from '/screens/home/components/HomeView'
import LauncherView from '/screens/konnectors/LauncherView'
import CliskDevView from '/screens/konnectors/CliskDevView'
import { StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { useLauncherContext } from '/screens/home/hooks/useLauncherContext'
import { shouldShowCliskDevMode } from '/core/tools/env'

import { styles } from '/screens/home/HomeScreen.styles'

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
    onKonnectorLog,
    onKonnectorJobUpdate,
    resetLauncherContext,
    setLauncherContext,
    trySetLauncherContext
  } = useLauncherContext()

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} />

      {shouldShowCliskDevMode() ? (
        <CliskDevView setLauncherContext={trySetLauncherContext} />
      ) : (
        <HomeView
          navigation={navigation}
          route={route}
          setBarStyle={setBarStyle}
          setLauncherContext={trySetLauncherContext}
        />
      )}

      {canDisplayLauncher() && (
        <LauncherView
          launcherClient={launcherClient}
          launcherContext={launcherContext.value}
          retry={resetLauncherContext}
          setLauncherContext={setLauncherContext}
          onKonnectorLog={onKonnectorLog}
          onKonnectorJobUpdate={onKonnectorJobUpdate}
        />
      )}

      {LauncherDialog}
    </View>
  )
}
