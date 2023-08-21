import { NavigationProp, ParamListBase } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'

import { useOAuthClientsLimitExceeded } from '/app/view/Limits/hooks/useOAuthClientsLimitExceeded'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'

interface OauthClientsLimitExceededProps {
  navigation: NavigationProp<ParamListBase>
}

export const OauthClientsLimitExceeded = ({
  navigation
}: OauthClientsLimitExceededProps): JSX.Element | null => {
  const { popupUrl, interceptNavigation, interceptOpenWindow } =
    useOAuthClientsLimitExceeded(navigation)
  const { setShouldWaitCozyApp, shouldWaitCozyApp } = useHomeStateContext()

  useEffect(() => {
    if (popupUrl && shouldWaitCozyApp) {
      // When the default app is different than cozy-home, then the default cozy-app won't
      // open because it is blocked by the OAuth Client limitation mechanism so we have to manually
      // tell the HomeView to stop waiting for the never coming cozy-app
      setShouldWaitCozyApp(false)
    }
  }, [popupUrl, shouldWaitCozyApp, setShouldWaitCozyApp])

  return popupUrl ? (
    <View style={styles.dialog}>
      <WebView
        source={{ uri: popupUrl }}
        onShouldStartLoadWithRequest={interceptNavigation}
        onOpenWindow={interceptOpenWindow}
      />
    </View>
  ) : null
}

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})
