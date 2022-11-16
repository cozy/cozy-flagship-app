import React from 'react'
import { Text, TextProps } from 'react-native'

import { styles } from '/ui/Typography/styles'

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'button'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'underline'

type TypographyColor =
  | 'initial'
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'textPrimary'
  | 'textSecondary'
  | 'error'

interface TypographyProps extends TextProps {
  color?: TypographyColor
  variant?: TypographyVariant
}

export const Typography = ({
  color = 'textPrimary',
  children,
  variant = 'body2',
  style,
  ...props
}: TypographyProps): JSX.Element => (
  <Text style={[styles.base, styles[variant], styles[color], style]} {...props}>
    {children}
  </Text>
)
