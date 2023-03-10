import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

type IconButtonProps = TouchableOpacityProps

export const IconButton = ({
  children,
  disabled,
  onPress,
  style,
  ...props
}: IconButtonProps): JSX.Element => (
  <TouchableOpacity
    onPress={onPress}
    style={style}
    disabled={disabled}
    {...props}
  >
    {children}
  </TouchableOpacity>
)
