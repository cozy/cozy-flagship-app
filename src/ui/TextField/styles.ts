import { StyleSheet, TextStyle, ViewStyle } from 'react-native'

import { CozyThemeColors } from '/ui/colors'

export interface TextFieldStyles {
  textField: TextStyle
  label: TextStyle
  endAdornment: ViewStyle
  input: TextStyle
}

export const styles = (colors: CozyThemeColors): TextFieldStyles =>
  StyleSheet.create({
    textField: {
      borderColor: colors.borderMainColor,
      borderRadius: 4,
      borderWidth: 1,
      display: 'flex',
      flexDirection: 'row',
      fontFamily: 'Inter-Regular',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      width: '100%'
    },
    label: {
      backgroundColor: colors.paperBackgroundColor,
      fontSize: 12,
      left: 16,
      padding: 4,
      position: 'absolute',
      top: -16
    },
    endAdornment: { marginRight: 16 },
    input: {
      color: colors.primaryTextColor,
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      paddingLeft: 16,
      paddingRight: 40,
      paddingVertical: 13,
      flex: 1
    }
  })
