import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { XmlProps } from 'react-native-svg'

import { styles } from '/ui/Icon/styles'

interface IconProps {
  icon: (props: Omit<XmlProps, 'xml'>) => JSX.Element
  color?: string
  size?: number
  style?: StyleProp<ViewStyle>
}

export const Icon = ({
  icon: Icon,
  size = 16,
  ...props
}: IconProps): JSX.Element => (
  <Icon
    {...(props.color ? { fill: props.color } : {})}
    style={[styles.icon, { width: size, height: size }]}
    {...props}
  />
)
