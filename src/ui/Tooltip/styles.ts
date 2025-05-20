import { StyleSheet } from 'react-native'

import { palette } from '/ui/palette'

export const styles = StyleSheet.create({
  tooltip: {
    width: '100%',
    position: 'relative',
    display: 'flex'
  },
  label: {
    alignItems: 'center',
    backgroundColor: palette.Error['500'],
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'row',
    marginTop: 4,
    padding: 8
  },
  icon: {
    marginRight: 8,
    width: 16,
    height: 16,
    // @ts-expect-error We use svg under the hood that understand this fill option
    fill: palette.Primary.ContrastText
  },
  text: {
    color: palette.Primary.ContrastText,
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Bold'
  }
})
