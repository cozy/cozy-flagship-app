import React, { useEffect } from 'react'
import { StyleSheet, View, Platform, BackHandler } from 'react-native'

import WebView from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WelcomePage } from '/components/html/WelcomePage'
import { makeHTML } from '/components/makeHTML'
import { routes } from '/constants/routes'
import { makeHandlers } from '/libs/functions/makeHandlers'
import { navigate } from '/libs/RootNavigation'
import { getColors } from '/theme/colors'
import { getNavbarHeight } from '/libs/dimensions'

export const WelcomeScreen = () => {
  const colors = getColors()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    console.log('🧝🧝🧝 WelcomeScreen: use effect')

    const handleBackPress = () => BackHandler.exitApp()
    BackHandler.addEventListener('hardwareBackPress', handleBackPress)
    return () => {
      console.log('🧝🧝🧝 WelcomeScreen: unmounted')

      BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
    }
  }, [])

  return (
    <View
      style={[
        styles.view,
        {
          backgroundColor: colors.primaryColor
        }
      ]}
    >
      <WebView
        onMessage={makeHandlers({
          onContinue: () => navigate(routes.stack)
        })}
        source={{ html: makeHTML(WelcomePage) }}
        style={{
          backgroundColor: colors.primaryColor
        }}
      />
      <View
        style={{
          height: Platform.OS === 'ios' ? insets.bottom : getNavbarHeight()
        }}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
