import { useLauncherContext } from '/screens/home/hooks/useLauncherContext'

import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'
import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'

import { OauthClientsLimitExceeded } from '/app/view/Limits/OauthClientsLimitExceeded'
import HomeView from '/screens/home/components/HomeView'
import { StatusBarStyle } from '/libs/intents/setFlagshipUI'
import { getColors } from '/ui/colors'
import { shouldShowCliskDevMode } from '/core/tools/env'

import { styles } from '/screens/home/HomeScreen.styles'

import CliskDevView from '../konnectors/CliskDevView'

interface HomeScreenProps {
  navigation: NavigationProp<ParamListBase>
  route: RouteProp<ParamListBase>
}

export const HomeScreen = ({
  navigation,
  route
}: HomeScreenProps): JSX.Element => {
  const [barStyle, setBarStyle] = useState<StatusBarStyle>()
  const colors = getColors()
  const { trySetLauncherContext, launcherContext } = useLauncherContext()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primaryColor
        }
      ]}
    >
      {barStyle ? <StatusBar barStyle={barStyle} /> : null}

      {shouldShowCliskDevMode() ? (
        launcherContext.state === 'default' ? (
          <CliskDevView setLauncherContext={trySetLauncherContext} />
        ) : null
      ) : (
        <HomeView
          navigation={navigation}
          route={route}
          setBarStyle={setBarStyle}
        />
      )}

      <OauthClientsLimitExceeded navigation={navigation} />
    </View>
  )
}
