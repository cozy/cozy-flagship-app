import { StyleSheet, ViewStyle } from 'react-native'

import { CozyThemeColors } from '/ui/colors'

export interface ButtonStyles {
  button: ViewStyle
  primary: ViewStyle
  secondary: ViewStyle
  disabled_primary: ViewStyle
  disabled_secondary: ViewStyle
}

export const styles = (colors: CozyThemeColors): ButtonStyles =>
  StyleSheet.create({
    button: {
      borderRadius: 2,
      paddingHorizontal: 16,
      paddingVertical: 11,
      width: '100%'
    },
    primary: {
      backgroundColor: colors.primaryColor
    },
    secondary: {
      backgroundColor: colors.paperBackgroundColor,
      borderColor: colors.borderMainColor,
      borderWidth: 1
    },
    disabled_primary: {
      color: colors.actionColorDisabled,
      backgroundColor: colors.actionColorDisabledBackground
    },
    disabled_secondary: {
      color: colors.actionColorDisabled,
      backgroundColor: 'transparent'
    }
  })
