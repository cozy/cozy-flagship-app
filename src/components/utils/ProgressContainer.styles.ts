import { StyleSheet } from 'react-native'

import { getColors } from '../components/colors'

const colors = getColors()

export const styles = StyleSheet.create({
  downloadProgressContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.paperBackgroundColor,
    opacity: 0.8
  },
  downloadProgress: {
    width: '60%'
  }
})
