import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import { styles } from '/ui/Button/styles'

type ButtonProps = TouchableOpacityProps & { variant?: 'primary' | 'secondary' }

export const Button = ({
  children,
  disabled,
  onPress,
  style,
  variant = 'primary',
  ...props
}: ButtonProps): JSX.Element => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, styles[variant], style]}
    disabled={disabled}
    {...props}
  >
    {children}
  </TouchableOpacity>
)
