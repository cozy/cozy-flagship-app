import { StyleSheet } from 'react-native'

import palette from '/theme/palette.json'

export const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.Common.white,
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 11,
    width: '100%'
  }
})
