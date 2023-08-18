import { NavigationProp, ParamListBase } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'

import { useOAuthClientsLimitExceeded } from '/app/view/Limits/hooks/useOAuthClientsLimitExceeded'

interface OauthClientsLimitExceededProps {
  navigation: NavigationProp<ParamListBase>
}

export const OauthClientsLimitExceeded = ({
  navigation
}: OauthClientsLimitExceededProps): JSX.Element | null => {
  const { popupUrl, interceptNavigation, interceptOpenWindow } = useOAuthClientsLimitExceeded(navigation)

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
