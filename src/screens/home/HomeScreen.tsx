import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'
import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'

import CozyClient, { CozyProvider } from 'cozy-client'

import HomeView from '/screens/home/components/HomeView'
import LauncherView from '/screens/connectors/LauncherView'
import { StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { styles } from '/screens/home/HomeScreen.styles'
import { useLauncherClient } from '/hooks/useLauncherClient'
import { LauncherContext } from '/libs/connectors/models'

interface HomeScreenProps {
  navigation: NavigationProp<ParamListBase>
  route: RouteProp<ParamListBase>
}

const isLauncherReady = (
  context: LauncherContext
): context is LauncherContext => context.state !== 'default'

const isClientReady = (client: CozyClient | undefined): client is CozyClient =>
  Boolean(client)

export const HomeScreen = ({
  navigation,
  route
}: HomeScreenProps): JSX.Element => {
  const [barStyle, setBarStyle] = useState(StatusBarStyle.Light)
  const [launcherContext, setLauncherContext] = useState<LauncherContext>({
    state: 'default'
  })
  const { launcherClient } = useLauncherClient(launcherContext.value)

  return (
    <View style={styles.container}>
      <StatusBar barStyle={barStyle} />

      <HomeView
        navigation={navigation}
        route={route}
        setBarStyle={setBarStyle}
        setLauncherContext={setLauncherContext}
      />

      {isLauncherReady(launcherContext) && isClientReady(launcherClient) && (
          <LauncherView
            launcherClient={launcherClient}
            launcherContext={launcherContext.value}
            retry={(): void => setLauncherContext({ state: 'default' })}
            setLauncherContext={setLauncherContext}
          />
      )}
    </View>
  )
}
