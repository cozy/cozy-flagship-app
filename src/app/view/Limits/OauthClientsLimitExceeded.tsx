import React from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'

import { useOAuthClientsLimitExceeded } from '/app/view/Limits/hooks/useOAuthClientsLimitExceeded'

export const OauthClientsLimitExceeded = (): JSX.Element | null => {
  const { popupUrl } = useOAuthClientsLimitExceeded()

  return popupUrl ? (
    <View style={styles.dialog}>
      <WebView source={{ uri: popupUrl }} />
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
