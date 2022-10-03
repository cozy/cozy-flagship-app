import React, { useEffect, useState } from 'react'
import { View, StatusBar } from 'react-native'

import { statusBarHeight, getNavbarHeight } from '/libs/dimensions'
import {
  flagshipUI,
  NormalisedFlagshipUI,
  StatusBarStyle
} from '/libs/intents/setFlagshipUI'
import { styles } from '/components/ui/FlagshipBars.styles'

export const FlagshipBars = ({
  initialUi = {
    bottomBackground: 'transparent',
    bottomOverlay: 'transparent',
    topBackground: 'transparent',
    topOverlay: 'transparent',
    topTheme: StatusBarStyle.Default
  }
}): JSX.Element => {
  const [UIState, setUIState] = useState<NormalisedFlagshipUI>(initialUi)
  const {
    bottomBackground,
    bottomOverlay,
    topBackground,
    topTheme,
    topOverlay
  } = UIState

  useEffect(() => {
    flagshipUI.on('change', (state: NormalisedFlagshipUI) => {
      setUIState({ ...UIState, ...state })
    })

    return () => {
      flagshipUI.removeAllListeners()
    }
  }, [UIState])

  return (
    <>
      <StatusBar translucent barStyle={topTheme} />

      <View
        style={{
          height: statusBarHeight,
          backgroundColor: topBackground,
          ...styles.top
        }}
      />

      <View
        style={{
          height: statusBarHeight,
          backgroundColor: topOverlay,
          ...styles.top,
          ...styles.innerOverlay
        }}
      />

      <View
        style={{
          height: getNavbarHeight(),
          backgroundColor: bottomBackground,
          ...styles.bottom
        }}
      />

      <View
        style={{
          height: getNavbarHeight(),
          backgroundColor: bottomOverlay,
          ...styles.bottom,
          ...styles.innerOverlay
        }}
      />
    </>
  )
}
