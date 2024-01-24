import { BlurView } from '@react-native-community/blur'
import React from 'react'
import { View, StyleProp, ViewStyle, ViewProps } from 'react-native'

import { Typography } from '/ui/Typography'
import ProgressBar from '/components/Bar'
import { CozyTheme } from '/ui/CozyTheme/CozyTheme'
import { getDimensions } from '/libs/dimensions'

import { hPadding, styles } from '/ui/LoadingOverlay/LoadingOverlay.styles'

export interface LoadingOverlayProps extends ViewProps {
  loadingMessage: string
  style?: StyleProp<ViewStyle>
}

const progressBarConfig = {
  indeterminate: true,
  unfilledColor: 'rgba(255, 255, 255, 0.32)',
  color: 'rgba(255, 255, 255, 1)',
  borderWidth: 0,
  height: 4
}

export const LoadingOverlay = ({
  loadingMessage,
  style
}: LoadingOverlayProps): JSX.Element => {
  console.log('💜 getDimensions() from LoadingOverlay')
  return (
    // Always want inverted here because the overlay is on top of a dark background
    <CozyTheme variant="inverted">
      <View style={[styles.container, style]}>
        <BlurView style={styles.absolute} blurType="dark" blurAmount={10} />

        <View style={styles.containerContent}>
          <Typography variant="body1" style={{ marginBottom: hPadding * 0.5 }}>
            {loadingMessage}
          </Typography>

          <ProgressBar
            width={getDimensions().screenWidth - hPadding}
            {...progressBarConfig}
          />
        </View>
      </View>
    </CozyTheme>
  )
}
