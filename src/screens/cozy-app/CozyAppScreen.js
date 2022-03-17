import React, {useEffect} from 'react'
import {StatusBar, View} from 'react-native'
import {useState} from 'react'

import {navbarHeight, statusBarHeight} from '../../libs/dimensions'
import {flagshipUI, setFlagshipUI} from '../../libs/intents/setFlagshipUI'
import CozyWebView from '../../components/webviews/CozyWebView'
import {innerBottomOverlay} from './CozyAppScreen.styles'

export const CozyAppScreen = ({route, navigation}) => {
  const [UIState, setUIState] = useState({})
  const {bottomBackground, bottomOverlay, topBackground, topTheme, topOverlay} =
    UIState

  useEffect(() => {
    flagshipUI.on('change', state => {
      setUIState({...UIState, ...state})
    })

    return () => {
      flagshipUI.removeAllListeners()
    }
  }, [UIState])

  useEffect(() => {
    setFlagshipUI({
      bottomBackground: 'white',
      bottomTheme: 'dark',
      bottomOverlay: 'transparent',
      topBackground: 'white',
      topTheme: 'dark',
      topOverlay: 'transparent',
    })
  }, [])

  return (
    <>
      <StatusBar translucent backgroundColor={topOverlay} barStyle={topTheme} />
      <View
        style={{
          height: statusBarHeight,
          backgroundColor: topBackground,
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
          backgroundColor: bottomBackground,
        }}>
        <View
          style={{
            backgroundColor: bottomOverlay,
            ...innerBottomOverlay,
          }}
        />
      </View>
    </>
  )
}
