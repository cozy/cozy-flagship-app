import {Settings} from '../screens/settings'
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'
import HomeNavigator from './HomeNavigator'

const GlobalStack = createStackNavigator()

const AppNavigator = () => (
  <GlobalStack.Navigator
    initialRouteName="Home"
    screenOptions={{headerShown: false}}>
    <GlobalStack.Screen name="Home" component={HomeNavigator} />
    <GlobalStack.Screen name="Settings" component={Settings} />
  </GlobalStack.Navigator>
)

export default AppNavigator
