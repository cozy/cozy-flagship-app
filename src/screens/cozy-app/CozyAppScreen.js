import React, { useCallback, useMemo } from 'react'
import { StatusBar, View } from 'react-native'

import { CozyProxyWebView } from '/components/webviews/CozyProxyWebView'
import { NetService } from '/libs/services/NetService'
import { useDimensions } from '/libs/dimensions'
import { routes } from '/constants/routes'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'
import { Animation } from '/screens/cozy-app/CozyAppScreen.Animation'

import useUIState from './useUIState'

import { styles } from '/screens/cozy-app/CozyAppScreen.styles'

const handleError = ({ nativeEvent }) => {
  const { code, description } = nativeEvent

  if (code === -2 && description === 'net::ERR_INTERNET_DISCONNECTED')
    NetService.handleOffline(routes.stack)
}

/**
 * CozyAppScreen component.
 * Renders the main screen for a Cozy app, managing UI state and animations.
 * @param {{
 *   route: RouteProps,
 *   navigation: NavigationProp,
 * }} props - The props for the component, containing the route and navigation objects.
 * @returns {ReactElement} The rendered CozyAppScreen component.
 */
export const CozyAppScreen = ({ route, navigation }) => {
  const {
    UIState,
    isFirstHalf,
    isReady,
    setFirstHalf,
    setReady,
    shouldExitAnimation,
    setShouldExitAnimation
  } = useUIState(route)
  const {
    bottomBackground,
    bottomOverlay,
    topBackground,
    topTheme,
    topOverlay
  } = UIState
  const { setShouldWaitCozyApp } = useHomeStateContext()

  const dimensions = useDimensions()

  const onLoadEnd = useCallback(() => {
    setShouldExitAnimation(true)
    setShouldWaitCozyApp(false)
  }, [setShouldExitAnimation, setShouldWaitCozyApp])

  const webViewStyle = useMemo(
    () => ({ ...styles[isFirstHalf ? 'ready' : 'notReady'] }),
    [isFirstHalf]
  )

  return (
    <>
      <StatusBar translucent barStyle={topTheme} />

      <View
        style={{
          height: isFirstHalf
            ? dimensions.statusBarHeight
            : styles.immersiveHeight,
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
            shouldExit={shouldExitAnimation}
            params={route.params.iconParams}
            slug={route.params.slug}
          />
        )}

        <CozyProxyWebView
          style={webViewStyle}
          slug={route.params.slug}
          href={route.params.href}
          navigation={navigation}
          route={route}
          logId="AppScreen"
          onLoadEnd={onLoadEnd}
          onError={handleError}
        />
      </View>

      <View
        style={{
          height: isFirstHalf
            ? dimensions.navbarHeight
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
