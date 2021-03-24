import {Settings} from '../screens/settings'
import Konnectors from '../screens/konnectors'
import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import HomeIcon from '../assets/home.svg'
import SettingsIcon from '../assets/setting.svg'
import CozyLaughIcon from '../assets/cozy-laugh.svg'
import HomeNavigator from './HomeNavigator'

const Tab = createBottomTabNavigator()

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused}) => {
        const fill = focused ? '#297EF2' : 'gray'
        if (route.name === 'Home') {
          return <HomeIcon fill={fill} />
        } else if (route.name === 'Settings') {
          return <SettingsIcon fill={fill} />
        } else if (route.name === 'Konnectors') {
          return <CozyLaughIcon fill={fill} />
        }

        return null
      },
    })}
    tabBarOptions={{
      activeTintColor: '#297EF2',
      inactiveTintColor: 'gray',
    }}>
    <Tab.Screen name="Home" component={HomeNavigator} />
    <Tab.Screen name="Settings" component={Settings} />
    <Tab.Screen name="Konnectors" component={Konnectors} />
  </Tab.Navigator>
)

export default AppNavigator
