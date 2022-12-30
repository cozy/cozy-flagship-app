import { StyleSheet } from 'react-native'

import { getDimensions } from '/libs/dimensions'
import { palette } from '/ui/palette'

const { statusBarHeight } = getDimensions()

export const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.Primary['600'],
    height: '100%',
    paddingHorizontal: 16,
    paddingTop: statusBarHeight + 16
  }
})
