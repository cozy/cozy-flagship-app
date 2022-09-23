import React from 'react'
import { View, ViewProps } from 'react-native'

import { styles } from '/ui/Grid/styles'

interface GridProps extends ViewProps {
  alignItems?: 'flex-start' | 'baseline' | 'center' | 'flex-end' | 'stretch'
  container?: boolean
  direction?: 'column' | 'column-reverse' | 'row' | 'row-reverse'
  justifyContent?:
    | 'center'
    | 'flex-end'
    | 'flex-start'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
}

export const Grid = ({
  direction = 'row',
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  container = false,
  children,
  style,
  ...props
}: GridProps): JSX.Element => (
  <View
    style={[
      styles.grid,
      container ? styles.container : {},
      { flexDirection: direction, justifyContent, alignItems },
      style
    ]}
    {...props}
  >
    {children}
  </View>
)
