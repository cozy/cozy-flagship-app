import { StyleSheet, TextStyle } from 'react-native'

import { CozyThemeColors } from '/ui/colors'
import { palette } from '/ui/palette'

export interface TypographyStyles {
  base: TextStyle
  initial: TextStyle
  inherit: TextStyle
  primary: TextStyle
  secondary: TextStyle
  textPrimary: TextStyle
  textSecondary: TextStyle
  error: TextStyle
  h4: TextStyle
  body2: TextStyle
  underline: TextStyle
  button: TextStyle
  h1: TextStyle
  h2: TextStyle
  h3: TextStyle
  h5: TextStyle
  subtitle1: TextStyle
  subtitle2: TextStyle
  body1: TextStyle
  caption: TextStyle
  link: TextStyle
}

export const styles = (colors: CozyThemeColors): TypographyStyles =>
  StyleSheet.create({
    base: { fontFamily: 'Lato-Regular' },
    initial: { color: colors.primaryTextColor }, // should be removed?
    inherit: { color: colors.primaryTextColor }, // should be removed?
    primary: { color: colors.primaryColor },
    secondary: { color: colors.secondaryTextColor },
    textPrimary: { color: colors.primaryTextColor },
    textSecondary: { color: colors.secondaryTextColor },
    error: { color: colors.errorColor },
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
    h2: {
      fontSize: 35,
      fontFamily: 'Lato-Bold'
    },
    h3: {
      fontSize: 20,
      fontFamily: 'Lato-Bold',
      color: palette.Grey['900']
    },
    h5: { fontSize: 18, fontFamily: 'Lato-Bold', lineHeight: 23 },
    subtitle1: { fontSize: 16 },
    subtitle2: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Lato-Bold',
      textTransform: 'uppercase'
    },
    body1: { fontSize: 16 },
    caption: { fontSize: 12, lineHeight: 16, fontFamily: 'Lato-Regular' },
    link: {
      fontFamily: 'Lato-Regular',
      fontSize: 14,
      lineHeight: 19,
      textDecorationLine: 'underline'
    }
  })
