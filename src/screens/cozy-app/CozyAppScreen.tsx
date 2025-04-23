import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'

import { FlagshipUI } from 'cozy-intent'

import {
  flagshipUIEventHandler,
  flagshipUIEvents,
  FlagshipUiUpdateEvent,
  ScreenIndexes,
  useFlagshipUI
} from '/app/view/FlagshipUI'
import { CozyProxyWebView } from '/components/webviews/CozyProxyWebView'
import { useDimensions } from '/libs/dimensions'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'
import { getColorScheme } from '/app/theme/colorScheme'

import { AnimatedIconScreen } from './AnimatedIconScreen/AnimatedIconScreen'
import { handleError } from './CozyAppScreen.functions'
import { styles } from './CozyAppScreen.styles'
import { CozyAppScreenProps } from './CozyAppScreen.types'

import { getColors } from '/ui/colors'

const getDefaultFlagshipUI = (): FlagshipUI => {
  const colors = getColors()

  return {
    bottomBackground: colors.paperBackgroundColor,
    bottomTheme: getColorScheme() === 'dark' ? 'light' : 'dark',
    bottomOverlay: 'transparent',
    topBackground: colors.paperBackgroundColor,
    topTheme: getColorScheme() === 'dark' ? 'light' : 'dark',
    topOverlay: 'transparent'
  }
}

export const CozyAppScreen = ({
  route,
  navigation
}: CozyAppScreenProps): JSX.Element => {
  const [UIState, setUIState] = useState<FlagshipUI>({})
  const { bottomBackground, bottomOverlay, topBackground, topOverlay } = UIState
  const [isReady, setReady] = useState(false)
  const { setShouldWaitCozyApp } = useHomeStateContext()
  const colors = getColors()

  const { componentId } = useFlagshipUI(
    'CozyAppScreen',
    ScreenIndexes.COZY_APP_VIEW,
    getDefaultFlagshipUI()
  )

  useEffect(() => {
    const handleFlagshipUiUpdateEvent = (
      state: FlagshipUiUpdateEvent
    ): void => {
      if (state.id === componentId) {
        setUIState({ ...UIState, ...state.ui })
      }
    }

    flagshipUIEventHandler.on(
      flagshipUIEvents.UPDATED_COMPONENT,
      handleFlagshipUiUpdateEvent
    )

    return () => {
      flagshipUIEventHandler.removeListener(
        flagshipUIEvents.UPDATED_COMPONENT,
        handleFlagshipUiUpdateEvent
      )
    }
  }, [UIState, route, componentId])

  useEffect(() => {
    if (isReady) return // We don't want to trigger the animation UI changes twice (in case of app unlock for instance)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !route.params.iconParams && setReady(true)
  }, [isReady, route.params.iconParams])

  const dimensions = useDimensions()

  const onLoadEnd = useCallback(() => {
    setTimeout(() => {
      setReady(true)
      setShouldWaitCozyApp(false)
    }, 2000)
  }, [setShouldWaitCozyApp])

  const wrapperStyle = useMemo(
    () => ({ ...styles[isReady ? 'ready' : 'notReady'] }),
    [isReady]
  )

  return (
    <>
      {isReady && (
        <View
          style={{
            height: dimensions.statusBarHeight,
            backgroundColor: topBackground ?? colors.paperBackgroundColor
          }}
        >
          <View
            style={{
              backgroundColor: topOverlay,
              ...styles.innerOverlay
            }}
          />
        </View>
      )}

      <View style={styles.mainView}>
        <CozyProxyWebView
          style={{ backgroundColor: colors.paperBackgroundColor }}
          wrapperStyle={wrapperStyle}
          slug={route.params.slug}
          href={route.params.href}
          navigation={navigation}
          route={route}
          logId="AppScreen"
          onLoadEnd={onLoadEnd}
          onError={handleError}
          keyboardVerticalOffset={dimensions.statusBarHeight}
          componentId={componentId}
        />
      </View>

      {isReady && (
        <View
          style={{
            height: dimensions.navbarHeight,
            backgroundColor: bottomBackground ?? colors.paperBackgroundColor
          }}
        >
          <View
            style={{
              backgroundColor: bottomOverlay,
              ...styles.innerOverlay
            }}
          />
        </View>
      )}

      {!isReady && <AnimatedIconScreen slug={route.params.slug} />}
    </>
  )
}
