import { StyleSheet } from 'react-native'

import { palette } from '/ui/palette'

export const styles = StyleSheet.create({
  button: {
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 11,
    width: '100%'
  },
  primary: {
    backgroundColor: palette.Common.white,
    borderColor: 'rgba(29, 33, 42, 0.16)',
    borderWidth: 1
  },
  secondary: {
    backgroundColor: palette.Primary['600']
  }
})
