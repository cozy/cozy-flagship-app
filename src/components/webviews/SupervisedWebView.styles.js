import { StyleSheet } from 'react-native'

import { getColors } from '/theme/colors'

const colors = getColors()

export const styles = StyleSheet.create({
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
