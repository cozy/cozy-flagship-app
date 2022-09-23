import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

type LinkProps = TouchableOpacityProps

export const Link = ({
  children,
  disabled,
  onPress,
  style,
  ...props
}: LinkProps): JSX.Element => (
  <TouchableOpacity
    onPress={onPress}
    style={[{ width: '100%' }, style]}
    disabled={disabled}
    {...props}
  >
    {children}
  </TouchableOpacity>
)
