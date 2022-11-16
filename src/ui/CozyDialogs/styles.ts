import { StyleSheet } from 'react-native'

import { palette } from '/ui/palette'

export const styles = StyleSheet.create({
  actions: {
    marginHorizontal: 4,
    width: '50%'
  },
  content: {
    marginBottom: 24,
    paddingHorizontal: 32
  },
  dialog: {
    alignSelf: 'center',
    backgroundColor: palette.Common.white,
    borderRadius: 8,
    boxShadow:
      '0px 0px 0px 0.5px rgba(29, 33, 42, 0.12), 0px 8px 12px -5px rgba(29, 33, 42, 0.18), 0px 9px 36px 5px rgba(29, 33, 42, 0.17)',
    justifyself: 'center'
  },
  dialogContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    padding: 24,
    width: '100%'
  },
  footer: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: -4,
    marginRight: 12,
    paddingBottom: 24,
    paddingHorizontal: 32
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 32,
    paddingTop: 24
  }
})
