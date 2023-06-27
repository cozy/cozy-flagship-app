import React from 'react'
import { StyleSheet, View } from 'react-native'

import ProgressBar from '/components/Bar'
import { getColors } from '/ui/colors'
import { palette } from '/ui/palette'

const colors = getColors()

export const RemountProgress = (): JSX.Element => {
  return (
    <View style={styles.progressBarContainer}>
      <ProgressBar {...progressBarConfig} />
    </View>
  )
}

const progressBarConfig = {
  width: null,
  indeterminate: true,
  unfilledColor: palette.Grey[200],
  color: palette.Primary[600],
  borderWidth: 0,
  height: 8,
  borderRadius: 100,
  indeterminateAnimationDuration: 1500
}

const styles = StyleSheet.create({
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: '20%',
    backgroundColor: colors.paperBackgroundColor
  }
})
