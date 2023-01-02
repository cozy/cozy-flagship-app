import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'

import HomeView from '/screens/home/components/HomeView'
import LauncherView from '/screens/connectors/LauncherView'
import { StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { styles } from '/screens/home/HomeScreen.styles'
import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'

interface HomeScreenProps {
  navigation: NavigationProp<ParamListBase>
  route: RouteProp<ParamListBase>
}

export const HomeScreen = ({
  navigation,
  route
}: HomeScreenProps): JSX.Element => {
  const [barStyle, setBarStyle] = useState(StatusBarStyle.Light)
  const [launcherContext, setLauncherContext] = useState<{
    state: string
    value?: Record<string, unknown>
  } | null>({ state: 'default' })

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} />

      <HomeView
        navigation={navigation}
        route={route}
        setBarStyle={setBarStyle}
        setLauncherContext={setLauncherContext}
      />

      {launcherContext?.state === 'launch' && (
        <LauncherView
          launcherContext={launcherContext.value}
          retry={(): void => setLauncherContext(null)}
          setLauncherContext={setLauncherContext}
        />
      )}
    </View>
  )
}
