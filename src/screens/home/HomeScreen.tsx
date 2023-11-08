import { useLauncherContext } from '/screens/home/hooks/useLauncherContext'

import {
  NavigationProp,
  ParamListBase,
  RouteProp
} from '@react-navigation/native'
import React from 'react'
import { View } from 'react-native'

import { OauthClientsLimitExceeded } from '/app/view/Limits/OauthClientsLimitExceeded'
import { ClouderyOffer } from '/app/view/IAP/ClouderyOffer'
import HomeView from '/screens/home/components/HomeView'
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
      {shouldShowCliskDevMode() ? (
        launcherContext.state === 'default' ? (
          <CliskDevView setLauncherContext={trySetLauncherContext} />
        ) : null
      ) : (
        <HomeView navigation={navigation} route={route} />
      )}

      <OauthClientsLimitExceeded navigation={navigation} />
      <ClouderyOffer />
    </View>
  )
}
