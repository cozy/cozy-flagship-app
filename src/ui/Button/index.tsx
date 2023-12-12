import React, { useMemo } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import { ButtonStyles, styles as computeStyles } from '/ui/Button/styles'
import { useCozyTheme } from '/ui/CozyTheme/CozyTheme'

type ButtonProps = TouchableOpacityProps & { variant?: 'primary' | 'secondary' }

export const Button = ({
  children,
  disabled,
  onPress,
  style,
  variant = 'primary',
  ...props
}: ButtonProps): JSX.Element | null => {
  const { colors } = useCozyTheme()
  const styles = useMemo<ButtonStyles>(() => computeStyles(colors), [colors])

  return (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.button,
      styles[variant],
        disabled ? styles[`disabled_${variant}`] : {},
      style
    ]}
    disabled={disabled}
    {...props}
  >
    {children}
  </TouchableOpacity>
)
}
