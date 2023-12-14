import { StyleSheet } from 'react-native'

import { palette } from '/ui/palette'

export const styles = StyleSheet.create({
  actions: {
    flexGrow: 1,
    width: 'auto'
  },
  actionsLast: {
    marginLeft: 8
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
    justifyself: 'center',
    width: '100%'
  },
  dialogContainer: {
    width: '100%',
    height: '100%',
    margin: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: 24,
    paddingHorizontal: 16,
    width: '100%'
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
