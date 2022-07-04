import React from 'react'
import { StyleSheet, View, Platform } from 'react-native'

import WebView from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WelcomePage } from '/components/html/WelcomePage'
import { makeHTML } from '/components/makeHTML'
import { makeHandlers } from '/libs/functions/makeHandlers'
import { getColors } from '/theme/colors'
import { getNavbarHeight } from '/libs/dimensions'

export const WelcomeScreen = ({ onContinue }) => {
  console.log('👩‍💻 WelcomeScreen launched')

  const colors = getColors()
  const insets = useSafeAreaInsets()
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
          onContinue: () => onContinue()
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
