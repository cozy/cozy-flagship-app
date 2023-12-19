import { FlexAlignType } from 'react-native'

import { palette } from '/ui/palette'

export const osReceiveScreenStyles = {
  page: {
    backgroundColor: palette.Common.white
  },
  disabled: {
    opacity: 0.5
  },
  goBackButton: {
    marginRight: 16
  },
  singleFileTitle: { alignSelf: 'center', marginBottom: 24 },
  appIcon: { minWidth: 32 },
  appName: {
    lineHeight: 21
  },
  thumbnail: {
    marginBottom: 16,
    alignSelf: 'center' as FlexAlignType
  }
}
