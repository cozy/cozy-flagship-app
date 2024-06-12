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

import { Animation } from './CozyAppScreen.Animation'
import { handleError } from './CozyAppScreen.functions'
import { styles } from './CozyAppScreen.styles'
import { CozyAppScreenProps } from './CozyAppScreen.types'

import { getColors } from '/ui/colors'

const defaultFlagshipUI: FlagshipUI = {
  bottomBackground: 'white',
  bottomTheme: 'dark',
  bottomOverlay: 'transparent',
  topBackground: 'white',
  topTheme: 'dark',
  topOverlay: 'transparent'
}

export const CozyAppScreen = ({
  route,
  navigation
}: CozyAppScreenProps): JSX.Element => {
  const [UIState, setUIState] = useState<FlagshipUI>({})
  const { bottomBackground, bottomOverlay, topBackground, topOverlay } = UIState
  const [isReady, setReady] = useState(false)
  const [isFirstHalf, setFirstHalf] = useState(false)
  const [shouldExitAnimation, setShouldExitAnimation] = useState(false)
  const { setShouldWaitCozyApp } = useHomeStateContext()
  const colors = getColors()

  const { componentId } = useFlagshipUI(
    'CozyAppScreen',
    ScreenIndexes.COZY_APP_VIEW,
    defaultFlagshipUI
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
    setShouldExitAnimation(true)
    setShouldWaitCozyApp(false)
  }, [setShouldWaitCozyApp])

  const webViewStyle = useMemo(
    () => ({ ...styles[isFirstHalf ? 'ready' : 'notReady'] }),
    [isFirstHalf]
  )

  return (
    <>
      <View
        style={{
          height: dimensions.statusBarHeight,
          backgroundColor: isFirstHalf
            ? topBackground ?? colors.paperBackgroundColor
            : 'transparent'
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
        <CozyProxyWebView
          style={webViewStyle}
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

      <View
        style={{
          height: dimensions.navbarHeight,
          backgroundColor: isFirstHalf
            ? bottomBackground ?? colors.paperBackgroundColor
            : 'transparent'
        }}
      >
        <View
          style={{
            backgroundColor: bottomOverlay,
            ...styles.innerOverlay
          }}
        />
      </View>
      {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        route.params.iconParams && !isReady && (
          <Animation
            onFirstHalf={setFirstHalf}
            onFinished={setReady}
            shouldExit={shouldExitAnimation}
            params={route.params.iconParams}
            slug={route.params.slug}
          />
        )
      }
    </>
  )
}
