import { StyleSheet } from 'react-native'

import { palette } from '/ui/palette'

export const styles = StyleSheet.create({
  textField: {
    borderColor: palette.Primary.ContrastText,
    borderRadius: 4,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Lato-Regular',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%'
  },
  label: {
    backgroundColor: palette.Primary['600'],
    fontSize: 12,
    left: 16,
    padding: 4,
    position: 'absolute',
    top: -16
  },
  endAdornment: { marginRight: 16 },
  input: {
    color: palette.Primary.ContrastText,
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    paddingLeft: 16,
    paddingRight: 40,
    paddingVertical: 13,
    flex: 1
  }
})
