import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

import { palette } from '../palette'

interface DividerProps {
  style?: StyleProp<ViewStyle>
  leftOffset?: number
}

export const Divider = ({ leftOffset, style }: DividerProps): JSX.Element => (
  <View
    style={[
      {
        height: 1,
        flexDirection: 'row'
      },
      style
    ]}
  >
    <View style={{ width: leftOffset }} />
    <View
      style={{
        flex: 1,
        backgroundColor: palette.light.divider.divider
      }}
    />
  </View>
)
