import { StyleSheet } from 'react-native'

export const hPadding = 32

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  containerContent: {
    width: '100%',
    paddingHorizontal: hPadding,
    alignItems: 'center'
  }
})
