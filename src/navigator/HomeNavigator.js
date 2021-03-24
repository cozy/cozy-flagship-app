import {isWebApp} from '../utils'
import {Details, FileListPage, Home} from '../screens/home'
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

const HomeStack = createStackNavigator()

const HomeNavigator = () => (
  <HomeStack.Navigator
    initialRouteName={isWebApp() ? 'Home' : 'FileListPage'}
    screenOptions={{
      headerShown: !isWebApp(),
    }}>
    <HomeStack.Screen name="Home" component={Home} />
    <HomeStack.Screen name="FileListPage" component={FileListPage} />
    <HomeStack.Screen name="Details" component={Details} />
  </HomeStack.Navigator>
)

export default HomeNavigator
