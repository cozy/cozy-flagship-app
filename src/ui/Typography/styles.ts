import { StyleSheet } from 'react-native'

import { palette } from '/ui/palette'

export const styles = StyleSheet.create({
  base: { fontFamily: 'Lato-Regular' },
  initial: { color: palette.Primary.ContrastText },
  inherit: { color: palette.Primary.ContrastText },
  primary: { color: palette.Primary['600'] },
  secondary: { color: palette.Primary.ContrastText },
  textPrimary: { color: palette.Grey['900'] },
  textSecondary: { color: palette.Common.white },
  error: { color: palette.Primary.ContrastText },
  h4: {
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    lineHeight: 23
  },
  body2: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    lineHeight: 19
  },
  underline: {
    textDecorationLine: 'underline',
    fontSize: 16,
    lineHeight: 21
  },
  button: {
    color: palette.Primary['600'],
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    lineHeight: 18,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  h1: { fontSize: 16 },
  h2: { fontSize: 16 },
  h3: {
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: palette.Grey['900']
  },
  h5: { fontSize: 16 },
  subtitle1: { fontSize: 16 },
  subtitle2: { fontSize: 16 },
  body1: { fontSize: 16 },
  caption: { fontSize: 16 }
})
