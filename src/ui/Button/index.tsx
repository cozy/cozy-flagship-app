import React, { useMemo } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

import { ButtonStyles, styles as computeStyles } from '/ui/Button/styles'
import { useCozyTheme } from '/ui/CozyTheme/CozyTheme'
import { Typography } from '/ui/Typography'

type ButtonPropsbase = TouchableOpacityProps & {
  variant?: 'primary' | 'secondary'
  textColor?: string
}

type ButtonPropsWithChildren = ButtonPropsbase & {
  label?: never
  children: React.ReactNode
}

type ButtonPropsWithLabel = ButtonPropsbase & {
  label: string
  children?: never
}

type ButtonProps = ButtonPropsWithChildren | ButtonPropsWithLabel

export const Button = ({
  children,
  label,
  disabled,
  onPress,
  style,
  variant = 'primary',
  textColor,
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
      {children ? (
        children
      ) : (
        <Typography
          variant="button"
          style={[
            variant === 'primary' && {
              color: colors.primaryContrastTextColor
            },
            disabled && { color: colors.actionColorDisabled },
            textColor !== undefined && { color: textColor }
          ]}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  )
}
