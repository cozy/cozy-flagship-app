import { StyleSheet } from 'react-native'

import { palette } from '/ui/palette'

export const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: palette.light.border.main,
    borderRadius: 8,
    paddingVertical: 8
  },
  listSubheader: {
    textAlign: 'left',
    marginBottom: 16
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 16
  },
  listItemText: {
    flex: 1
  },
  listItemIcon: {
    marginRight: 16
  }
})
