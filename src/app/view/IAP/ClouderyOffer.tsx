import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'

import { useClouderyOffer } from '/app/view/IAP/hooks/useClouderyOffer'

export const ClouderyOffer = (): JSX.Element | null => {
  const { popupUrl } = useClouderyOffer()

  return popupUrl ? <WebViewWithLoadingOverlay popupUrl={popupUrl} /> : null
}

interface WebViewWithLoadingOverlayProps {
  popupUrl: string
}

const WebViewWithLoadingOverlay = ({
  popupUrl
}: WebViewWithLoadingOverlayProps): JSX.Element => {
  const [loading, setLoading] = useState(true)

  return (
    <View style={styles.dialog}>
      <WebView
        source={{ uri: popupUrl }}
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
