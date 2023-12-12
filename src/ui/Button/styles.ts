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
    borderColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 1
  },
  secondary: {
    backgroundColor: palette.Primary['600'],
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderWidth: 1
  },
  // TODO: this is actually the inverted theme with Primary style
  disabled_primary: {
    boxShadow: 'none',
    color: 'rgba(255,255,255,0.32)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 0
  },
  // TODO: this is actually the normal theme with Primary style
  disabled_secondary: {
    boxShadow: 'none',
    color: 'rgba(29,33,42,0.24)',
    backgroundColor: 'rgba(29,33,42,0.12)'
  }
})
