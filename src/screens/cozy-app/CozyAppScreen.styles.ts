import { StyleSheet } from 'react-native'

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
    zIndex: 1, // Will show up above CozyWebView,
    borderRadius: 8
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
