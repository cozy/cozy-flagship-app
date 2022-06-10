import React, { useEffect, useState } from 'react'
import { StatusBar, View, Platform } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CozyProxyWebView } from '../../components/webviews/CozyProxyWebView'
import { Animation } from './CozyAppScreen.Animation'
import { flagshipUI } from '../../libs/intents/setFlagshipUI'
import { getNavbarHeight, statusBarHeight } from '../../libs/dimensions'
import { styles } from './CozyAppScreen.styles'
import { internalMethods } from '../../libs/intents/localMethods'

const firstHalfUI = () =>
  internalMethods.setFlagshipUI({
    bottomBackground: 'white',
    bottomTheme: 'dark',
    bottomOverlay: 'transparent',
    topBackground: 'white',
    topTheme: 'dark',
    topOverlay: 'transparent'
  })

export const CozyAppScreen = ({ route, navigation }) => {
  const [UIState, setUIState] = useState({})
  const {
    bottomBackground,
    bottomOverlay,
    topBackground,
    topTheme,
    topOverlay
  } = UIState
  const [isReady, setReady] = useState(false)
  const [isFirstHalf, setFirstHalf] = useState(false)

  useEffect(() => {
    flagshipUI.on('change', state => {
      setUIState({ ...UIState, ...state })
    })

    return () => {
      flagshipUI.removeAllListeners()
    }
  }, [UIState])

  useEffect(() => {
    !route.params.iconParams && setReady(true)

    isFirstHalf && firstHalfUI()
  }, [isFirstHalf, route.params.iconParams])
  const insets = useSafeAreaInsets()

  return (
    <>
      <StatusBar translucent barStyle={topTheme} />

      <View
        style={{
          height: isFirstHalf ? statusBarHeight : styles.immersiveHeight,
          backgroundColor: topBackground
        }}
      >
        <View
          style={{
            backgroundColor: topOverlay,
            ...styles.innerOverlay
          }}
        />
      </View>

      <View style={styles.mainView}>
        {route.params.iconParams && !isReady && (
          <Animation
            onFirstHalf={setFirstHalf}
            onFinished={setReady}
            params={route.params.iconParams}
            slug={route.params.slug}
          />
        )}

        <CozyProxyWebView
          style={{ ...styles[isFirstHalf ? 'ready' : 'notReady'] }}
          slug={route.params.slug}
          href={route.params.href}
          navigation={navigation}
          route={route}
          logId="AppScreen"
        />
      </View>

      <View
        style={{
          height: isFirstHalf
            ? Platform.OS === 'ios'
              ? insets.bottom
              : getNavbarHeight()
            : styles.immersiveHeight,
          backgroundColor: bottomBackground
        }}
      >
        <View
          style={{
            backgroundColor: bottomOverlay,
            ...styles.innerOverlay
          }}
        />
      </View>
    </>
  )
}
