import React, {useEffect} from 'react'
import {View} from 'react-native'
import {changeBarColors} from 'react-native-immersive-bars'
import {useState} from 'react'

import CozyWebView from '../../components/webviews/CozyWebView'
import {Values} from '../../constants/values'
import {navBarColorEvent} from '../../libs/intents/setNavBarColor'
import {navbarHeight, statusBarHeight} from '../../libs/dimensions'
import {statusBarColorEvent} from '../../libs/intents/setStatusBarColor'

export const CozyAppScreen = ({route, navigation}) => {
  const [statusBarColor, setStatusBarColor] = useState(
    Values.DEFAULT_STATUSBAR_COLOR,
  )
  const [navBarColor, setNavBarColor] = useState(Values.DEFAULT_NAVBAR_COLOR)

  useEffect(() => {
    changeBarColors(false)

    statusBarColorEvent.on('change', color => {
      setStatusBarColor(color)
    })

    navBarColorEvent.on('change', color => {
      setNavBarColor(color)
    })

    return () => {
      statusBarColorEvent.removeAllListeners()
      navBarColorEvent.removeAllListeners()
    }
  }, [])

  return (
    <>
      <View
        style={{
          height: statusBarHeight,
          backgroundColor: statusBarColor,
        }}
      />
      <CozyWebView
        source={{uri: route.params.href}}
        navigation={navigation}
        route={route}
        logId="AppScreen"
      />
      <View
        style={{
          height: navbarHeight,
          backgroundColor: navBarColor,
        }}
      />
    </>
  )
}
