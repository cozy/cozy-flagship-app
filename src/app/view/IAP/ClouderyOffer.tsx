import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { withIAPContext } from 'react-native-iap'
import WebView from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import { useClouderyOffer } from '/app/view/IAP/hooks/useClouderyOffer'

const ClouderyOfferWithIAPContext = (): JSX.Element | null => {
  const { popupUrl, interceptNavigation, isBuying } =
    useClouderyOffer()

  return popupUrl ? (
    <>
      <WebViewWithLoadingOverlay
        popupUrl={popupUrl}
        interceptNavigation={interceptNavigation}
      />
      {isBuying && (
        <>
          <View
            style={[
              styles.loadingOverlay,
              {
                backgroundColor: colors.primaryColor
              }
            ]}
          />
        </>
      )}
    </>
  ) : null
}

export const ClouderyOffer = withIAPContext(ClouderyOfferWithIAPContext)

interface WebViewWithLoadingOverlayProps {
  popupUrl: string
  interceptNavigation: (request: WebViewNavigation) => boolean
}

const WebViewWithLoadingOverlay = ({
  popupUrl,
  interceptNavigation
}: WebViewWithLoadingOverlayProps): JSX.Element => {
  const [loading, setLoading] = useState(true)

  return (
    <View style={styles.dialog}>
      <WebView
        source={{ uri: popupUrl }}
        onShouldStartLoadWithRequest={interceptNavigation}
        onLoadEnd={(): void => setLoading(false)}
      />
      {loading && (
        <>
          <View
            style={[
              styles.loadingOverlay,
              {
                backgroundColor: colors.primaryColor
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
