import React, { useEffect, useState } from 'react'
import { View, StatusBar } from 'react-native'

import { lockScreenUi } from '/screens/lock/events/LockScreen.events'
import { useDimensions } from '../../../core/services/Device/dimensions'
import {
  NormalisedFlagshipUI,
  StatusBarStyle
} from '/libs/intents/setFlagshipUI'

import { styles } from '/screens/lock/view/LockScreenBars.styles'

export const LockScreenBars = ({
  initialUi = {
    bottomBackground: 'transparent',
    bottomOverlay: 'transparent',
    topBackground: 'transparent',
    topOverlay: 'transparent',
    topTheme: StatusBarStyle.Default
  }
}): JSX.Element => {
  const [UIState, setUIState] = useState<NormalisedFlagshipUI>(initialUi)
  const dimensions = useDimensions()
  const {
    bottomBackground,
    bottomOverlay,
    topBackground,
    topTheme,
    topOverlay
  } = UIState

  useEffect(() => {
    lockScreenUi.on('lockscreen:change', (state: NormalisedFlagshipUI) =>
      setUIState(prevState => ({ ...prevState, ...state }))
    )

    return () => {
      lockScreenUi.removeAllListeners()
    }
  }, [])

  return (
    <>
      <StatusBar translucent barStyle={topTheme} />

      <View
        style={{
          height: dimensions.statusBarHeight,
          backgroundColor: topBackground,
          ...styles.top
        }}
      />

      <View
        style={{
          height: dimensions.statusBarHeight,
          backgroundColor: topOverlay,
          ...styles.top,
          ...styles.innerOverlay
        }}
      />

      <View
        style={{
          height: dimensions.navbarHeight,
          backgroundColor: bottomBackground,
          ...styles.bottom
        }}
      />

      <View
        style={{
          height: dimensions.navbarHeight,
          backgroundColor: bottomOverlay,
          ...styles.bottom,
          ...styles.innerOverlay
        }}
      />
    </>
  )
}
