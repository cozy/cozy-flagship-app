import { StyleSheet } from 'react-native'

import { getColors } from '/ui/colors'

const colors = getColors()

export const styles = StyleSheet.create({
  ready: {
    backgroundColor: 'white',
    opacity: 1
  },
  notReady: {
    opacity: 0
  },
  innerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  fadingContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.paperBackgroundColor,
    zIndex: 1, // Will show up above CozyWebView,
    borderRadius: 8,
    boxShadow:
      '0px 0px 0px 0.5px rgba(29, 33, 42, 0.12), 0px 2px 4px rgba(29, 33, 42, 0.0793047), 0px 4px 16px rgba(29, 33, 42, 0.06)'
  },
  mainView: {
    flex: 1, // Allows full height for loading animation
    opacity: 1
  },
  immersiveHeight: {
    height: 0
  },
  progressBarContainer: {
    width: '60%',
    display: 'flex'
  }
})
