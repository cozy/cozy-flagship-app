import { BlurView } from '@react-native-community/blur'
import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

import { Typography } from '/ui/Typography'
import ProgressBar from '/components/Bar'

import { hPadding, styles } from '/ui/LoadingOverlay/LoadingOverlay.styles'

import { getDimensions } from '/libs/dimensions'
import { useI18n } from '/locales/i18n'

interface LoadingOverlayProps {
  style?: StyleProp<ViewStyle>
}

const progressBarConfig = {
  indeterminate: true,
  unfilledColor: 'rgba(255, 255, 255, 0.32)',
  color: 'rgba(255, 255, 255, 1)',
  borderWidth: 0,
  height: 4
}

const LoadingOverlay = ({ style }: LoadingOverlayProps): JSX.Element => {
  const { t } = useI18n()

  return (
    <View style={[styles.container, style]}>
      <BlurView style={styles.absolute} blurType="light" blurAmount={10} />

      <View style={styles.containerContent}>
        <Typography variant="body1" style={{ marginBottom: hPadding * 0.5 }}>
          {t('services.osReceive.shareFiles.downloadingFiles')}
        </Typography>

        <ProgressBar
          width={getDimensions().screenWidth - hPadding}
          {...progressBarConfig}
        />
      </View>
    </View>
  )
}

export default LoadingOverlay
