import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { withIAPContext } from 'react-native-iap'
import WebView from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import { FlagshipUI } from 'cozy-intent'

import { ScreenIndexes, useFlagshipUI } from '/app/view/FlagshipUI'
import { useClouderyOffer } from '/app/view/IAP/hooks/useClouderyOffer'
import { IapProgress } from '/app/view/IAP/IapProgress'
import { IapError } from '/app/view/IAP/IapError'
import { IapSuccess } from '/app/view/IAP/IapSuccess'
import { BackTo } from '/components/ui/icons/BackTo'
import { getDimensions } from '/libs/dimensions'
import { useI18n } from '/locales/i18n'
import { getColors } from '/ui/colors'

const colors = getColors()
const { statusBarHeight } = getDimensions()

const HEADER_PADDING_TOP = statusBarHeight + 8
const HEADER_PADDING_BOTTOM = 8
const HEADER_LINE_HEIGHT = 16
const TOUCHABLE_VERTICAL_PADDING = 8

const ClouderyOfferWithIAPContext = (): JSX.Element | null => {
  const {
    popupUrl,
    partialPopupUrl,
    instanceInfoLoaded,
    interceptNavigation,
    buyingState,
    retryBuySubscription,
    hidePopup,
    backToOffers
  } = useClouderyOffer()

  return partialPopupUrl && instanceInfoLoaded ? (
    <>
      <WebViewWithLoadingOverlay
        hidePopup={hidePopup}
        popupUrl={popupUrl}
        interceptNavigation={interceptNavigation}
      />
      {buyingState.state === 'BUYING' && <IapProgress />}
      {buyingState.state === 'ERROR' && (
        <IapError backToOffers={backToOffers} tryAgain={retryBuySubscription} />
      )}
      {buyingState.state === 'SUCCESS' && <IapSuccess hidePopup={hidePopup} />}
    </>
  ) : null
}

export const ClouderyOffer = withIAPContext(ClouderyOfferWithIAPContext)

const defaultFlagshipUI: FlagshipUI = {
  bottomTheme: 'dark',
  topTheme: 'dark'
}

interface WebViewWithLoadingOverlayProps {
  hidePopup: () => void
  popupUrl: string | null
  interceptNavigation: (request: WebViewNavigation) => boolean
}

const WebViewWithLoadingOverlay = ({
  hidePopup,
  popupUrl,
  interceptNavigation
}: WebViewWithLoadingOverlayProps): JSX.Element => {
  const [loading, setLoading] = useState(true)

  useFlagshipUI(
    'ClouderyOffer',
    ScreenIndexes.CLOUDERY_OFFER,
    defaultFlagshipUI
  )

  return (
    <View style={styles.dialog}>
      <BackButton onPress={hidePopup} />
      {popupUrl && (
        <WebView
          source={{ uri: popupUrl }}
          onShouldStartLoadWithRequest={interceptNavigation}
          onLoadEnd={(): void => setLoading(false)}
        />
      )}
      {loading && <LoadingOverlay />}
    </View>
  )
}

const overlayDefaultFlagshipUI: FlagshipUI = {
  bottomTheme: 'light',
  topTheme: 'light'
}

const LoadingOverlay = (): JSX.Element => {
  useFlagshipUI(
    'ClouderyOfferOverlay',
    ScreenIndexes.CLOUDERY_OFFER,
    overlayDefaultFlagshipUI
  )

  return (
    <View
      style={[
        styles.loadingOverlay,
        {
          backgroundColor: colors.primaryColor
        }
      ]}
    />
  )
}

interface BackButtonProps {
  onPress: () => void
}

const BackButton = ({ onPress }: BackButtonProps): JSX.Element => {
  const { t } = useI18n()

  return (
    <View style={styles.headerStyle}>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onPress}
        style={styles.headerTouchableStyle}
      >
        <BackTo color={colors.primaryColor} width={16} height={16} />
        <Text style={styles.headerTextStyle}>
          {t('screens.clouderyOffer.backButton')}
        </Text>
      </TouchableOpacity>
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
  },
  headerStyle: {
    alignContent: 'center',
    backgroundColor: colors.paperBackgroundColor,
    flexDirection: 'row',
    paddingBottom: HEADER_PADDING_BOTTOM,
    paddingHorizontal: 8,
    paddingTop: HEADER_PADDING_TOP
  },
  headerTouchableStyle: {
    flexDirection: 'row',
    paddingVertical: TOUCHABLE_VERTICAL_PADDING,
    paddingHorizontal: 6
  },
  headerTextStyle: {
    marginLeft: 10,
    fontSize: 13,
    fontFamily: 'Lato-Bold',
    lineHeight: HEADER_LINE_HEIGHT,
    color: colors.primaryColor
  }
})
