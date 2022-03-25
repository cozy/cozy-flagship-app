import React, {useEffect, useState} from 'react'
import {StatusBar, View} from 'react-native'

import CozyWebView from '../../components/webviews/CozyWebView'
import {Animation} from './CozyAppScreen.Animation'
import {flagshipUI, setFlagshipUI} from '../../libs/intents/setFlagshipUI'
import {navbarHeight, statusBarHeight} from '../../libs/dimensions'
import {styles} from './CozyAppScreen.styles'

export const CozyAppScreen = ({route, navigation}) => {
  const [UIState, setUIState] = useState({})
  const {bottomBackground, bottomOverlay, topBackground, topTheme, topOverlay} =
    UIState
  const [isReady, setReady] = useState(false)

  useEffect(() => {
    flagshipUI.on('change', state => {
      setUIState({...UIState, ...state})
    })

    return () => {
      flagshipUI.removeAllListeners()
    }
  }, [UIState])

  useEffect(() => {
    !route.params.iconParams && setReady(true)

    isReady &&
      setFlagshipUI({
        bottomBackground: 'white',
        bottomTheme: 'dark',
        bottomOverlay: 'transparent',
        topBackground: 'white',
        topTheme: 'dark',
        topOverlay: 'transparent',
      })
  }, [isReady, route.params.iconParams])

  return (
    <>
      <StatusBar translucent backgroundColor={topOverlay} barStyle={topTheme} />
      <View
        style={{
          height: isReady ? statusBarHeight : styles.immersiveHeight,
          backgroundColor: topBackground,
        }}
      />

      <View style={styles.mainView}>
        {route.params.iconParams && (
          <Animation
            onFinished={setReady}
            params={route.params.iconParams}
            slug={route.params.slug}
          />
        )}

        <CozyWebView
          style={{...styles[isReady ? 'ready' : 'notReady']}}
          source={{uri: route.params.href}}
          navigation={navigation}
          route={route}
          logId="AppScreen"
        />
      </View>

      <View
        style={{
          height: isReady ? navbarHeight : styles.immersiveHeight,
          backgroundColor: bottomBackground,
        }}>
        <View
          style={{
            backgroundColor: bottomOverlay,
            ...styles.innerBottomOverlay,
          }}
        />
      </View>
    </>
  )
}
