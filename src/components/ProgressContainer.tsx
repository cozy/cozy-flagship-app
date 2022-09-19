import React from 'react'
import { View } from 'react-native'

import ProgressBar from '/components/Bar'
import { styles } from '/components/ProgressContainer.styles'

import { getColors } from '/theme/colors'
import { default as paletteValues } from '/theme/palette.json'

const colors = getColors()

const progressBarConfig = {
  width: null,
  indeterminate: false,
  unfilledColor: paletteValues.Grey[200],
  color: colors.primaryColor,
  borderWidth: 0,
  height: 8,
  borderRadius: 0,
  indeterminateAnimationDuration: 1500
}

interface Props {
  children: JSX.Element
  progress: number
}

export const ProgressContainer: React.FC<Props> = ({
  children,
  progress
}: Props) => {
  return (
    <>
      {children}
      {progress > 0 && (
        <View style={styles.downloadProgressContainer}>
          <ProgressBar
            {...progressBarConfig}
            progress={progress}
            style={styles.downloadProgress}
          />
        </View>
      )}
    </>
  )
}
