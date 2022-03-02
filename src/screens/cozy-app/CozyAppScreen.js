import React, {useEffect} from 'react'
import {changeBarColors} from 'react-native-immersive-bars'

import CozyWebView from '../../components/webviews/CozyWebView'

export const CozyAppScreen = ({route, navigation}) => {
  useEffect(() => {
    changeBarColors(false)
  }, [])

  return (
    <CozyWebView
      source={{uri: route.params.href}}
      navigation={navigation}
      route={route}
      logId="AppScreen"
    />
  )
}
