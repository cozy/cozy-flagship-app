import React, { useEffect, useState } from 'react'
import { View, StatusBar, StyleSheet } from 'react-native'

import { lockScreenUi } from '/app/domain/authorization/events/LockScreenUiManager'
import { useDimensions } from '/libs/dimensions'
import {
  NormalisedFlagshipUI,
  StatusBarStyle
} from '/libs/intents/setFlagshipUI'

const styles = StyleSheet.create({
  top: { position: 'absolute', width: '100%', left: 0, top: 0 },
  bottom: { position: 'absolute', width: '100%', left: 0, bottom: 0 },
  innerOverlay: {
    zIndex: 1
  }
})

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
