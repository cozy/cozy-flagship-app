import { NavigationProp, ParamListBase } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'
import type {
  WebViewOpenWindowEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes'

import { useOAuthClientsLimitExceeded } from '/app/view/Limits/hooks/useOAuthClientsLimitExceeded'
import { useHomeStateContext } from '/screens/home/HomeStateProvider'
import { palette } from '/ui/palette'

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
    <WebViewWithLoadingOverlay
      popupUrl={popupUrl}
      interceptNavigation={interceptNavigation}
      interceptOpenWindow={interceptOpenWindow}
    />
  ) : null
}

interface WebViewWithLoadingOverlayProps {
  popupUrl: string
  interceptNavigation: (request: WebViewNavigation) => boolean
  interceptOpenWindow: (syntheticEvent: WebViewOpenWindowEvent) => void
}

const WebViewWithLoadingOverlay = ({
  popupUrl,
  interceptNavigation,
  interceptOpenWindow
}: WebViewWithLoadingOverlayProps): JSX.Element => {
  const [loading, setLoading] = useState(true)

  return (
    <View style={styles.dialog}>
      <WebView
        source={{ uri: popupUrl }}
        onShouldStartLoadWithRequest={interceptNavigation}
        onOpenWindow={interceptOpenWindow}
        onLoadEnd={(): void => setLoading(false)}
      />
      {loading && (
        <>
          <View
            style={[
              styles.loadingOverlay,
              {
                backgroundColor: 'white'
              }
            ]}
          />
          <View
            style={[
              styles.loadingOverlay,
              {
                backgroundColor: palette.Grey[900],
                opacity: 0.5
              }
            ]}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})
