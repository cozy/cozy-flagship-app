import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import { styles } from '/ui/Button/styles'

type ButtonProps = TouchableOpacityProps

export const Button = ({
  children,
  disabled,
  onPress,
  style,
  ...props
}: ButtonProps): JSX.Element => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, style]}
    disabled={disabled}
    {...props}
  >
    {children}
  </TouchableOpacity>
)
