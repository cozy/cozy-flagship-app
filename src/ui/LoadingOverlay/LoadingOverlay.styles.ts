import { StyleSheet } from 'react-native'

import { ScreenIndexes } from '/app/view/FlagshipUI'

export const hPadding = 32

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
    zIndex: ScreenIndexes.LOADING_OVERLAY
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
